import express, { Request, Response } from 'express'
import { makeSeasonsRepo, seasonsRepo } from '../repos/seasonsRepo.js'

export const makeSeasonsRouter = (seasonsRepo: ReturnType<typeof makeSeasonsRepo>) => {
    const seasonsRouter = express.Router()

    seasonsRouter.get('/:id', async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const season = await seasonsRepo.getSeasonById(id)
            if (season) {
                res.json(season)
            } else {
                res.status(404).json({ error: `Season with id=${id} doesn't exist`})
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'detail' in err) {
                res.status(500).json({ error: `Failed to get season. ${err.detail}` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to get season. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to get season.` })
            }
        }
    })

    seasonsRouter.post('/', async (req: Request, res: Response) => {
        try {
            const { name, league_id, start_date, end_date } = req.body
            // const start_date = new Date(req.body.start_date)
            // const end_date = new Date(req.body.end_date)
            if (!name || !league_id || !start_date || !end_date) {
                return res.status(400).json({ error: 'Missing required fields.' })
            }
            
            const newSeason = { name, league_id, start_date, end_date }
            const insertedSeason = await seasonsRepo.insertSeason(newSeason)
            res.status(201).json(insertedSeason)
        } catch (err) {
            if (err && typeof err === 'object' && 'detail' in err) {
                res.status(500).json({ error: `Failed to post season. ${err.detail}` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to post season. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to post season.` })
            }
        }
    })
    return seasonsRouter
}