import { getAPITeamsFromSeason } from "../../api-clients/teamsClient.js"
import { seasonsRepo } from "../repos/seasonsRepo.js"
import { teamsRepo } from "../repos/teamsRepo.js"
import { APITeam, TeamsAPIResponse } from "../types/API-Football/teams.js"
import { Season } from "../types/seasons.js"
import { Team } from "../types/teams.js"

const { getSeasonById } = seasonsRepo


type TeamsRepoPort = Pick<typeof teamsRepo, 'insertManyTeams'>
type SeasonsRepoPort  = Pick<typeof seasonsRepo,  'getSeasonById'>

export const makeTeamsService = (
    deps: {
        seasonsRepo: SeasonsRepoPort,
        teamsRepo: TeamsRepoPort,
        getAPITeamsFromSeason: (leagueId: number, year: number) => Promise<TeamsAPIResponse>
    }
) => {
    const { seasonsRepo, teamsRepo, getAPITeamsFromSeason } = deps

    const addTeamsForSeason = async (seasonId: number): Promise<number> => {
        const season: Season | undefined = await seasonsRepo.getSeasonById(seasonId)
        if (!season) {
            return 0
        }
        const { league_id, start_date } = season
        const year = Number(start_date.slice(0,4))

        const apiTeams = await getAPITeamsFromSeason(league_id, year)
        const teams: Team[] = apiTeams.response.map((teamObject: APITeam) => {
            const team: Team = {
                id: teamObject.team.id,
                name: teamObject.team.name,
                code: teamObject.team.code,
                country: teamObject.team.country
            }
            return team
        })
        const count = await teamsRepo.insertManyTeams(teams)
        return count
    }

    return {
        addTeamsForSeason
    }
}

export const TeamsService = makeTeamsService({
    seasonsRepo,
    teamsRepo,
    getAPITeamsFromSeason
})