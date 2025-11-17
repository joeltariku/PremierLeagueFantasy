import { QueryResult, QueryResultRow } from "pg"
import { Fixture } from "../types/fixture.js"
import { conn } from "../../utils/db.js"

type DB = {
    query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>
}

export const makeFixturesRepo = (db: DB) => {
    const getAllFixturesFromSeason = async (seasonId: number): Promise<Fixture[]> => {
        const fetch_query = 'SELECT * FROM fixtures WHERE season_id = $1'
        const result = await db.query<Fixture>(fetch_query, [seasonId])
        return result.rows
    }

    const getFixturesFromSeasonGameweek = async (seasonId: number, gameweek: number): Promise<Fixture[]> => {
        const fetch_query = 'SELECT * FROM fixtures WHERE season_id = $1 AND gameweek = $2'
        const result = await db.query<Fixture>(fetch_query, [seasonId, gameweek])
        return result.rows
    }

    const getFixtureById = async (fixtureId: number): Promise<Fixture | undefined> => {
        const fetch_query = 'SELECT * FROM fixtures WHERE id = $1'
        const result = await db.query<Fixture>(fetch_query, [fixtureId])
        return result.rows[0]
    }

    const insertFixture = async (fixture: Fixture): Promise<Fixture | undefined> => {
        const { id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals } = fixture
        const insert_query = 'INSERT INTO fixtures (id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *'
        const result = await db.query<Fixture>(insert_query, [id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals ])
        return result.rows[0]
    }

    const insertFixtures = async (fixtures: Fixture[]) => {
        if (fixtures.length == 0) return 0
        let count = 0
        for (const fixture of fixtures) {
            const existingFixture = await getFixtureById(fixture.id)
            if (!existingFixture) {
                await insertFixture(fixture)
                count++
            }
        }
        return count
    }

    const updateFixture = async (fixture: Fixture): Promise<Fixture | undefined> => {
        const { date, status, home_goals, away_goals, id} = fixture
        const update_query =
            `UPDATE fixtures
            SET date = $1, status = $2, home_goals = $3, away_goals = $4
            WHERE id = $5 AND status != 'Match Finished'
            RETURNING *`
        const result = await db.query<Fixture>(update_query, [date, status, home_goals, away_goals, id])
        return result.rows[0]
    }

    const updateFixtures = async (fixtures: Fixture[]) => {
        let count = 0;
        for (const fixture of fixtures) {
            const updated = await updateFixture(fixture)
            if (updated) {
                count++  
            }
        }
        return count
    }
    

    return {
        getAllFixturesFromSeason,
        getFixturesFromSeasonGameweek,
        getFixtureById,
        insertFixture,
        insertFixtures,
        updateFixture,
        updateFixtures
    }
}

export const fixturesRepo = makeFixturesRepo(conn)