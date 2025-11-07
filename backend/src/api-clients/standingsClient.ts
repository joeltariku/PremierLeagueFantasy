import axios from "axios";
import { getSeasonById } from "../PremierLeague/services/seasonsService";
import { TeamStandingsAPIResponse } from "../PremierLeague/types/API-Football/teamStandings";
import { Season } from "../PremierLeague/types/seasons";
import { getErrorMessages } from "../PremierLeague/services/API-Football";

export const getStandingsFromSeason = async (seasonId: number): Promise<TeamStandingsAPIResponse> => {
    const season: Season | undefined = await getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Failed to get season with id=${seasonId}`)
    }

    const leagueId = season.league_id;
    const startYear = season.start_date.getFullYear()

    const response = await axios.get('https://v3.football.api-sports.io/standings', {
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