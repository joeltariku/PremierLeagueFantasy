import Bottleneck from "bottleneck"
import { getAPIPlayerInfoFromId, getAPIPlayersFromTeamSeason } from "../../api-clients/playersClient.js"
import { playersRepo } from "../repos/playersRepo.js"
import { Player } from "../types/player.js"
import { teamSeasonsRepo } from "../repos/teamSeasonsRepo.js"

const limiter = new Bottleneck({
    maxConcurrent: 5, 
    minTime: 200      
})

export const makePlayersService = (deps: {
    playersRepo: typeof playersRepo,
    teamSeasonsRepo: typeof teamSeasonsRepo,
    getAPIPlayersFromTeamSeason: typeof getAPIPlayersFromTeamSeason,
    getAPIPlayerInfoFromId: typeof getAPIPlayerInfoFromId
}) => {
    const { playersRepo, teamSeasonsRepo, getAPIPlayersFromTeamSeason, getAPIPlayerInfoFromId } = deps

    const addPlayersForTeamSeason = async (teamId: number, seasonId: number): Promise<number> => {
        const teamSeasonAPIPlayers = await getAPIPlayersFromTeamSeason(teamId, seasonId)
        const ids = teamSeasonAPIPlayers.map(player => player.player.id);

        console.log(ids.length)

        const promiseArray = ids.map(id =>
            limiter.schedule(async () =>{
                const playerInfo = await getAPIPlayerInfoFromId(id)
                let position_code
                if (playerInfo.player.position === 'Goalkeeper') {
                    position_code = 'GK'
                } else if (playerInfo.player.position === 'Defender') {
                    position_code = 'DEF'
                } else if (playerInfo.player.position === 'Midfielder') {
                    position_code = 'MID'
                } else { 
                    position_code = 'ATT'
                }

                const player: Player = {
                    id: playerInfo.player.id,
                    team_id: teamId,
                    position_code: position_code,
                    first_name: playerInfo.player.firstname,
                    last_name: playerInfo.player.lastname,
                    display_name: playerInfo.player.name,
                    dob: playerInfo.player.birth.date
                }
                return playersRepo.insertPlayer(player)
                // return player
            })
        )

        const players = await Promise.all(promiseArray)

        console.log(players)

        return players.filter(player => player !== undefined).length
    }

    const addAllPlayersForSeason = async (seasonId: number): Promise<number> => {
        const teamIds = await teamSeasonsRepo.getAllTeamsFromSeason(seasonId)
        console.log('Number of teams in season:', teamIds.length)

        const result = await Promise.all(
            teamIds.map(teamId => 
                limiter.schedule(() => addPlayersForTeamSeason(teamId, seasonId))
            )
        )

        const totalInserted = result.reduce((sum, count) => sum + count, 0)
        
        return totalInserted
    }

    return {
        addPlayersForTeamSeason,
        addAllPlayersForSeason
    }
}

export const playersService = makePlayersService({
    playersRepo,
    teamSeasonsRepo,
    getAPIPlayersFromTeamSeason,
    getAPIPlayerInfoFromId
})