import axios from "axios"
import { TeamsAPIResponse } from "../PremierLeague/types/API-Football/teams.js"
import { getErrorMessages } from "../PremierLeague/services/API-Football.js"

export const getAPITeamsFromSeason = async (leagueId: number, startYear: number): Promise<TeamsAPIResponse> => {
    const response = await axios.get<TeamsAPIResponse>('https://v3.football.api-sports.io/teams', {
        headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_KEY
        },
        params: {
            league: leagueId,
            season: startYear
        }
    })

    const errors = getErrorMessages(response.data.errors)
    if (errors.length != 0) {
        throw new Error(`${errors.join('; ')}`)
    }

    return response.data
}
