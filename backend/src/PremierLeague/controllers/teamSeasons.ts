import express, { Request, Response } from "express"
import { makeTeamSeasonsRepo } from "../repos/teamSeasonsRepo.js";
import { TeamSeason } from "../types/teamSeason.js";


export const makeTeamSeasonsRouter = (teamSeasonRepo: ReturnType<typeof makeTeamSeasonsRepo>) => {
    const teamSeasonsRouter = express.Router()

    teamSeasonsRouter.get('/seasons/:seasonId/teams/:teamId', async (req: Request, res: Response) => {
        try {
            const seasonId = Number(req.params.seasonId)
            const teamId = Number(req.params.teamId)

            const teamSeason = await teamSeasonRepo.getTeamSeasonBySeasonIdAndTeamId(seasonId, teamId)
            if (teamSeason) {
                res.json(teamSeason)
            } else {
                res.status(404).json({ error: `Team season with season_id=${seasonId} and team_id=${teamId} doesn't exist.` })
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                res.status(500).json({ error: `Failed to get teamSeason. Postgres error code ${err.code}.` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to get teamSeason. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to get teamSeason.` })
            }
        }
    })

    teamSeasonsRouter.post('/', async (req: Request, res: Response) => {
        try {
            const { season_id, team_id, points, rank, goals_scored, goals_conceded } = req.body
            if (!season_id || !team_id || points === undefined || !rank || goals_scored === undefined || goals_conceded === undefined) {
                return res.status(400).json({ error: 'Missing one or more required fields.' })
            }

            const newTeamSeason: TeamSeason = {
                season_id: Number(season_id),
                team_id: Number(team_id),
                points: Number(points),
                rank: Number(rank),
                goals_scored: Number(goals_scored),
                goals_conceded: Number(goals_conceded)
            }

            const insertedTeamSeason = await teamSeasonRepo.insertTeamSeason(newTeamSeason)
            res.status(201).json(insertedTeamSeason)      
        }  catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                res.status(500).json({ error: `Failed to post teamSeason. Postgres error code ${err.code}.` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to post teamSeason. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to post teamSeason.` })
            }
        }
    })

    return teamSeasonsRouter
}