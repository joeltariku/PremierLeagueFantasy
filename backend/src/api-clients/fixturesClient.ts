import axios from "axios"
import { getErrorMessages } from "../PremierLeague/services/API-Football.js"
import { FixtureAPIResposne } from "../PremierLeague/types/API-Football/fixture.js"
import { Season } from "../PremierLeague/types/seasons.js"
import { seasonsRepo } from "../PremierLeague/repos/seasonsRepo.js"


export const getFixturesFromSeason = async (seasonId: number): Promise<FixtureAPIResposne> => {
    const season: Season | undefined = await seasonsRepo.getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Failed to get season with id=${seasonId}`)
    }

    const leagueId = season.league_id;
    const startYear = Number(season.start_date.slice(0,4))

    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
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

export const getAPIFixturesFromSeasonGameweek = async (seasonId: number, gameweek: number): Promise<FixtureAPIResposne> => {
    const season: Season | undefined = await seasonsRepo.getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Failed to get season with id=${seasonId}`)
    }

    const leagueId = season.league_id
    const startYear = Number(season.start_date.slice(0,4))
    const round = `Regular Season - ${gameweek}`

    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_KEY
        },
        params: {
            league: leagueId,
            season: startYear,
            round: round
        }
    })

    const errors = getErrorMessages(response.data.errors)
    if (errors.length != 0) {
        throw new Error(`${errors.join('; ')}`)
    }

    return response.data
}