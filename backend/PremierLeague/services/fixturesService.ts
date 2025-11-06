import { getAPIFixturesFromSeasonGameweek, getFixturesFromSeason } from "../../api-clients/fixturesClient"
import { conn } from "../../utils/db"
import { APIFixture, FixtureAPIResposne } from "../types/API-Football/fixture"
import { Fixture } from "../types/fixture"
import { Season } from "../types/seasons"
import { getSeasonById } from "./seasonsService"

export const getAllFixtursFromSeason = async (seasonId: number) => {
    const fetch_query = 'SELECT * FROM fixtures WHERE season_id = $1'
    const result = await conn.query(fetch_query, [seasonId])
    return result.rows
}

export const getFixutresFromSeasonGameweek = async (seasonId: number, gameweek: number): Promise<Fixture[]> => {
    const fetch_query = 'SELECT * FROM fixtures WHERE season_id = $1 AND gameweek = $2'
    const result = await conn.query(fetch_query, [seasonId, gameweek])
    return result.rows
}

export const getFixtureById = async (fixtureId: number) => {
    const fetch_query = 'SELECT * FROM fixtures WHERE id = $1'
    const result = await conn.query(fetch_query, [fixtureId])
    return result.rows[0]
}

export const insertFixture = async (fixture: Fixture) => {
    const { id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals } = fixture
    const insert_query = 'INSERT INTO fixtures (id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *'
    const result = await conn.query(insert_query, [id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals ])
    return result.rows[0]
}

export const insertFixtures = async (
    fixtures: Fixture[],
    deps: {
        getFixtureById: (fixtureId: number) => Promise<Fixture | undefined>,
        insertFixture: (fixture: Fixture) => Promise<Fixture>
    } = { getFixtureById, insertFixture }
) => {
    if (fixtures.length == 0) return 0
    let count = 0

    for (const fixture of fixtures) {
        const existingFixture = await deps.getFixtureById(fixture.id)
        if (!existingFixture) {
            await deps.insertFixture(fixture)
            count++
        }
    }
    return count;
}
    
export const addFixturesForSeason = async (
    seasonId: number,
    deps: {
        getSeasonById: (seasonId: number) => Promise<Season | undefined>,
        getFixturesFromSeason: (seasonId: number) => Promise<FixtureAPIResposne>,
        insertFixtures: (fixtures: Fixture[]) => Promise<number>
    } = { getSeasonById, getFixturesFromSeason, insertFixtures }
) => {
    const season: Season | undefined = await deps.getSeasonById(seasonId)
    if(!season) {
        throw new Error(`Failed to get season with id = ${seasonId}`)
    }

    const apiFixtures = await deps.getFixturesFromSeason(seasonId)
    const fixtures: Fixture[] = apiFixtures.response.map((fixtureObject: APIFixture) => {
        const gwParts = fixtureObject.league.round.split('-')
        const gameweek = parseInt(gwParts[1])
        const fixture: Fixture = {
            id: fixtureObject.fixture.id,
            season_id: seasonId,
            gameweek: gameweek,
            date: new Date(fixtureObject.fixture.date),
            home_team_id: fixtureObject.teams.home.id,
            away_team_id: fixtureObject.teams.away.id,
            status: fixtureObject.fixture.status.long,
            home_goals: fixtureObject.goals.home || 0,
            away_goals: fixtureObject.goals.away || 0
        }
        return fixture
    })
    const count = await deps.insertFixtures(fixtures)
    return count
}

const updateFixture = async (fixture: Fixture) => {
    const { date, status, home_goals, away_goals, id} = fixture
    const update_query =
         `UPDATE fixtures
         SET date = $1, status = $2, home_goals = $3, away_goals = $4
         WHERE id = $5 AND status != 'Match Finished'
         RETURNING *`
    const result = await conn.query(update_query, [date, status, home_goals, away_goals, id])
    return result.rows[0]
}

export const updateFixtures = async (fixtures: Fixture[]) => {
    let count = 0;
    for (const fixture of fixtures) {
        const updated = await updateFixture(fixture)
        if (updated) {
            count++  
        }
    }
    return count
}

export const updateFixturesFromSeasonGW = async (
    seasonId: number,
    gameweek: number,
    deps: {
        getAPIFixturesFromSeasonGameweek: (seasonId: number, gameweek: number) => Promise<FixtureAPIResposne>,
        getSeasonById: (seasonId: number) => Promise<Season | undefined>,
        updateFixtures: (fixtures: Fixture[]) => Promise<number>
    } = { getAPIFixturesFromSeasonGameweek , getSeasonById, updateFixtures } 
) => {
    const season: Season | undefined = await deps.getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Cannot find season with id=${seasonId}`)
    }

    const apiFixtures = await deps.getAPIFixturesFromSeasonGameweek(seasonId, gameweek)
    const fixtures: Fixture[] = apiFixtures.response.map((fixtureObject: APIFixture) => {
        const gwParts = fixtureObject.league.round.split('-')
        const gameweek = parseInt(gwParts[1])
        const fixture: Fixture = {
            id: fixtureObject.fixture.id,
            season_id: seasonId,
            gameweek: gameweek,
            date: new Date(fixtureObject.fixture.date),
            home_team_id: fixtureObject.teams.home.id,
            away_team_id: fixtureObject.teams.away.id,
            status: fixtureObject.fixture.status.long,
            home_goals: fixtureObject.goals.home || 0,
            away_goals: fixtureObject.goals.away || 0
        }
        return fixture
    })
    const count = await deps.updateFixtures(fixtures)
    return count
}