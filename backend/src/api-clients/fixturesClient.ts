import axios from "axios"
import { getErrorMessages } from "../PremierLeague/services/API-Football"
import { FixtureAPIResposne } from "../PremierLeague/types/API-Football/fixture"
import { Season } from "../PremierLeague/types/seasons"
import { getSeasonById } from "../PremierLeague/services/seasonsService"

export const getFixturesFromSeason = async (seasonId: number): Promise<FixtureAPIResposne> => {
    const season: Season | undefined = await getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Failed to get season with id=${seasonId}`)
    }

    const leagueId = season.league_id;
    const startYear = season.start_date.getFullYear()

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
    const season: Season | undefined = await getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Failed to get season with id=${seasonId}`)
    }

    const leagueId = season.league_id
    const startYear = season.start_date.getFullYear()
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