import axios from "axios";
import { TeamStandingsAPIResponse } from "../PremierLeague/types/API-Football/teamStandings.js";
import { Season } from "../PremierLeague/types/seasons.js";
import { getErrorMessages } from "../PremierLeague/services/API-Football.js";
import { seasonsRepo } from "../PremierLeague/repos/seasonsRepo.js";

export const getStandingsFromSeason = async (seasonId: number): Promise<TeamStandingsAPIResponse> => {
    const season: Season | undefined = await seasonsRepo.getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Failed to get season with id=${seasonId}`)
    }

    const leagueId = season.league_id;
    const startYear = Number(season.start_date.slice(0,4))

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