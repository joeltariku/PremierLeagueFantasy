import express, { Request, Response } from 'express'
import { leaguesRepo } from '../repos/leaguesRepo.ts'

const leaguesRouter = express.Router()

leaguesRouter.get('/', async (req: Request, res: Response) => {
    try {
        const leagues = await leaguesRepo.getAllLeagues()
        res.json(leagues)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch leagues' })
    }
})

leaguesRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const leagueId = Number(req.params.id)
        const league = await leaguesRepo.getLeagueById(leagueId)
        if (league) {
            res.json(league)
        } else {
            res.status(404).json({ error: 'League not found' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch league' })
    }
})

leaguesRouter.post('/', async (req: Request, res: Response) => {
    try {
        const { id, name, base_country } = req.body
        if (!id || !name || !base_country) {
            return res.status(400).json({ error: 'Missing required fields' })
        }   
        const newLeague = await leaguesRepo.insertLeague({ id, name, base_country })
        res.status(201).json(newLeague)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to create league' })
    }
})

leaguesRouter.delete('/', async (req: Request, res: Response) => {

})

leaguesRouter.delete('/:id', async (req: Request, res: Response) => {
    
})
export default leaguesRouter