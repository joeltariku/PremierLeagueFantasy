import express, { Request, Response } from 'express'
import { makeFixturesRepo } from '../repos/fixturesRepo.js'
import { Fixture } from '../types/fixture.js'

export const makeFixturesRouter = (fixturesRepo: ReturnType<typeof makeFixturesRepo>) => {
    const fixturesRouter = express.Router()

    fixturesRouter.get('/:id', async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const fixture = await fixturesRepo.getFixtureById(id)
            if (fixture) {
                res.json(fixture)
            } else {
                res.status(404).json({ error: `Fixture with id=${id} doesn't exist.`})
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                res.status(500).json({ error: `Failed to get fixture. Postgres error code ${err.code}.` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to get fixture. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to get fixture.` })
            }
        }
    })

    fixturesRouter.get('/seasons/:seasonId', async (req: Request, res: Response) => {
        try {
            const seasonId = Number(req.params.seasonId)
            const fixtures = await fixturesRepo.getAllFixturesFromSeason(seasonId)
            res.json(fixtures)
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                res.status(500).json({ error: `Failed to get fixtures. Postgres error code ${err.code}.` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to get fixtures. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to get fixtures.` })
            }
        }
    })

    fixturesRouter.get('/seasons/:seasonId/gameweek/:gameweekId', async (req: Request, res: Response) => {
        try {
            const seasonId = Number(req.params.seasonId)
            const gameweekId = Number(req.params.gameweekId)
            const fixtures = await fixturesRepo.getFixturesFromSeasonGameweek(seasonId, gameweekId)
            res.json(fixtures)
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                res.status(500).json({ error: `Failed to get fixtures. Postgres error code ${err.code}.` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to get fixtures. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to get fixtures.` })
            }
        }
    })

    fixturesRouter.post('/', async (req: Request, res: Response) => {
        try {
            const { id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals} = req.body
            if (!id || !season_id || !gameweek || !date || !home_team_id || !away_team_id || !status || home_goals === undefined || away_goals === undefined) {
                return res.status(400).json({ error: 'Missing one or more required fields.' })
            }
            const fixture: Fixture = {
                id: Number(id),
                season_id: Number(season_id),
                gameweek: Number(gameweek),
                date: new Date(date),
                home_team_id: Number(home_team_id),
                away_team_id: Number(away_team_id),
                status,
                home_goals: Number(home_goals),
                away_goals: Number(away_goals)
            }
            const insertedFixture = await fixturesRepo.insertFixture(fixture)
            res.status(201).json(insertedFixture)
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                res.status(500).json({ error: `Failed to post fixture. Postgres error code ${err.code}.` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to post fixture. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to post fixture.` })
            }
        }
    })

    fixturesRouter.put('/:id', async (req: Request, res: Response) => {
        try { 
            const id = Number(req.params.id)
            const existingFixture = await fixturesRepo.getFixtureById(id)
            if (!existingFixture) {
                return res.status(404).json({ error: `Fixture with id=${id} doesn't exist.`})
            }

            const { date, status, home_goals, away_goals } = req.body
            if (!date || !status || home_goals === undefined || away_goals === undefined) {
                return res.status(400).json({ error: 'Missing one or more required fields.' })
            }

            const updatedFixture: Fixture = {
                ...existingFixture,
                date: new Date(date),
                status,
                home_goals: Number(home_goals),
                away_goals: Number(away_goals)
            }

            const result = await fixturesRepo.updateFixture(updatedFixture)
            res.json(result)
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                res.status(500).json({ error: `Failed to update fixture. Postgres error code ${err.code}.` })
            } else if (err instanceof Error) {
                res.status(500).json({ error: `Failed to update fixture. ${err.message}` })
            } else {
                res.status(500).json({ error: `Failed to update fixture.` })
            }
        }
    })

    return fixturesRouter
}