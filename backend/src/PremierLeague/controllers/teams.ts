import express, { Request, Response } from "express"
import { makeTeamsRepo, teamsRepo } from "../repos/teamsRepo.js"

export const makeTeamsRouter = (teamsRepo: ReturnType<typeof makeTeamsRepo>) => {
    const teamsRouter = express.Router()

    teamsRouter.get('/', async (req: Request, res: Response) => {
        try {
            const teams = await teamsRepo.getAllTeams()
            res.json(teams)
        } catch (err) {
            if (err && typeof err === 'object' && 'detail' in err) {
                res.status(500).json({ error: `Failed to get teams. ${err.detail}` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to get teams. ${err.message}` })
            } else {
                res.status(500).json({ error: 'Failed to get teams.' })
            }
        }
    })

    teamsRouter.get('/:id', async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const team = await teamsRepo.getTeamById(id)
            if (team) {
                res.json(team)
            } else {
                res.status(404).json({ error: `Team with id=${id} doesn't exist.`})
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'detail' in err) {
                res.status(500).json({ error: `Failed to get team. ${err.detail}` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to get team. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to get team.` })
            }
        }
    })

    teamsRouter.post('/', async (req: Request, res: Response) => {
        try {
            const { id, name, code, country } = req.body
            if (!id || !name || !code || !country) {
                return   res.status(400).json({ error: 'Missing required fields.' })
            }
            const team = {
                id,
                name,
                code, 
                country
            }
            const insertedTeam = await teamsRepo.insertTeam(team)
            res.status(201).json(insertedTeam)
        } catch (err) {
            if (err && typeof err === 'object' && 'detail' in err) {
                res.status(500).json({ error: `Failed to post team. ${err.detail}` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to post team. ${err.message}` })
            } else {
                res.status(500).json({ error: 'Failed to post team.' })
            }
        }
    })
    return teamsRouter
}
