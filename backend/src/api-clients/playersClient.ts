import axios, { all } from "axios"
import { seasonsRepo } from "../PremierLeague/repos/seasonsRepo.js"
import { teamSeasonsRepo } from "../PremierLeague/repos/teamSeasonsRepo.js"
import { teamsRepo } from "../PremierLeague/repos/teamsRepo.js"
import { getErrorMessages } from "../PremierLeague/services/API-Football.js"
import { Season } from "../PremierLeague/types/seasons.js"
import { TeamSeason } from "../PremierLeague/types/teamSeason.js"
import { APIPlayer, PlayerProfileAPIResponse, PlayersAPIResponse } from "../PremierLeague/types/API-Football/players.js"

export const getAPIPlayersFromTeamSeason = async (teamId: number, seasonId: number): Promise<APIPlayer[]> => {
    const season = await seasonsRepo.getSeasonById(seasonId)
    if (!season) {
        throw new Error(`Season with ID=${seasonId} not found`)
    }

    const startYear = Number(season.start_date.slice(0,4))
    const league_id = season.league_id

    const fetchPage = async (page: number): Promise<PlayersAPIResponse> => {
        const response = await axios.get<PlayersAPIResponse>('https://v3.football.api-sports.io/players', {
            headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
            },
            params: {
                team: teamId,
                season: startYear,
                page
            }
        })

        const errors = getErrorMessages(response.data.errors)
        if (errors.length != 0) {
            throw new Error(`${errors.join('; ')}`)
        }

        return response.data
    }

    const firstPage = await fetchPage(1)
    const allResponses = [...firstPage.response]
    const totalPages = firstPage.paging.total > 1 ? firstPage.paging.total : 1
    console.log(`Total pages for teamId=${teamId}, seasonId=${seasonId}: ${totalPages}`)

    for (let curPage = 2; curPage <= totalPages; curPage++) {
        const pageData = await fetchPage(curPage)
        allResponses.push(...pageData.response)
    }

    return allResponses
}

export const getAPIPlayerInfoFromId = async (playerId: number) => {
    const response = await axios.get<PlayerProfileAPIResponse>('https://v3.football.api-sports.io/players/profiles', {
        headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_KEY
        },
        params: {
            player: playerId,
        }
    })

    const errors = getErrorMessages(response.data.errors)
    if (errors.length != 0) {
        throw new Error(`${errors.join('; ')}`)
    }
    return response.data.response[0]
}