import { getAPIFixturesFromSeasonGameweek, getFixturesFromSeason } from "../../api-clients/fixturesClient.js"
import { fixturesRepo } from "../repos/fixturesRepo.js"
import { seasonsRepo } from "../repos/seasonsRepo.js"
import { APIFixture, FixtureAPIResposne } from "../types/API-Football/fixture.js"
import { Fixture } from "../types/fixture.js"
import { Season } from "../types/seasons.js"

type FixturesRepoPort = Pick<typeof fixturesRepo, 'insertFixtures' | 'updateFixtures'>
type SeasonsRepoPort  = Pick<typeof seasonsRepo,  'getSeasonById'>

export const makeFixturesService = (
    deps: {
        fixturesRepo: FixturesRepoPort,
        seasonsRepo: SeasonsRepoPort,
        getAPIFixturesFromSeason: (seasonId: number) => Promise<FixtureAPIResposne>,
        getAPIFixturesFromSeasonGameweek: (seasonId: number, gameweek: number) => Promise<FixtureAPIResposne>,
    }
) => {
    const { fixturesRepo, seasonsRepo } = deps
    const addFixturesForSeason = async (seasonId: number) => {
        const season: Season | undefined = await deps.seasonsRepo.getSeasonById(seasonId)
        if(!season) {
            throw new Error(`Failed to get season with id = ${seasonId}`)
        }

        const apiFixtures = await deps.getAPIFixturesFromSeason(seasonId)
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
        const count = await deps.fixturesRepo.insertFixtures(fixtures)
        return count
    }

    const updateFixturesFromSeasonGW = async (seasonId: number, gameweek: number) => {
        const season: Season | undefined = await seasonsRepo.getSeasonById(seasonId)
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
        const count = await fixturesRepo.updateFixtures(fixtures)
        return count
    }

    return {
        addFixturesForSeason,
        updateFixturesFromSeasonGW
    }
}

export const fixturesService = makeFixturesService({
    fixturesRepo: fixturesRepo,
    seasonsRepo: seasonsRepo,
    getAPIFixturesFromSeason: getFixturesFromSeason,
    getAPIFixturesFromSeasonGameweek: getAPIFixturesFromSeasonGameweek
})
