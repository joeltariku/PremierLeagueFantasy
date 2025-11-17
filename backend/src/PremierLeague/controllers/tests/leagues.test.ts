import { jest } from '@jest/globals'
import { conn } from '../../../utils/db'
import supertest from 'supertest'
import app from '../../../app'
import { League } from '../../types/league'
import { leaguesRepo } from '../../repos/leaguesRepo'

const api = supertest(app)

const mockLeagues: League[] = [
    {
        id: 39,
        name: 'Premier League',
        base_country: 'England'
    },
    {
        id: 40,
        name: 'La Liga',
        base_country: 'Spain'
    }   
]


describe('leaguesController', () => {
    beforeAll(async () => {
        const { rows } = await conn.query('SELECT current_database()')
        expect(rows[0].current_database).toBe('FantasyPL_Test')
    })
    beforeEach(async () => {
        await conn.query('TRUNCATE leagues CASCADE')
        await conn.query('INSERT INTO leagues (id, name, base_country) VALUES ($1, $2, $3)', [mockLeagues[0].id, mockLeagues[0].name, mockLeagues[0].base_country])
        await conn.query('INSERT INTO leagues (id, name, base_country) VALUES ($1, $2, $3)', [mockLeagues[1].id, mockLeagues[1].name, mockLeagues[1].base_country])
        jest.restoreAllMocks()
    })
    afterAll(async () => {
        conn.removeAllListeners('connect')
        conn.removeAllListeners('error')
        await conn.end()
    })
    describe('GET /api/leagues', () => {
        it('leagues are returned as json', async () => {
            await api
                .get('/api/leagues')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
        it('returns all leagues in the database', async () => {
            const result = await api.get('/api/leagues')

            expect(result.body).toHaveLength(mockLeagues.length)
            expect(result.body[0]).toEqual(mockLeagues[0])
            expect(result.body[1]).toEqual(mockLeagues[1])
        })
        it('handles database errors gracefully', async () => {
            jest.spyOn(leaguesRepo, 'getAllLeagues').mockRejectedValue(new Error('Database error'))

            const result = await api.get('/api/leagues')

            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to fetch leagues' })
        })
    })
    describe('GET /api/leagues/:id', () => {
        it('league is returned as json', async () => {
            await api
                .get('/api/leagues/39')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
        it('returns the correct league', async () => {
            const result = await api.get('/api/leagues/39')
            expect(result.body).toEqual(mockLeagues[0])
        })
        it('returns 404 if league not found', async () => {
            const result = await api.get('/api/leagues/999')
            expect(result.status).toBe(404)
            expect(result.body).toEqual({ error: 'League not found' })
        })
        it('handles database errors gracefully', async () => {
            jest.spyOn(leaguesRepo, 'getLeagueById').mockRejectedValue(new Error('Database error'))

            const result = await api.get('/api/leagues/39')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to fetch league' })
        })
    })
    describe('POST /api/leagues', () => {
        it('creates a new league when all required fields exist', async () => {
            const newLeague = {
                id: 52,
                name: 'Serie A',
                base_country: 'Italy'
            }

            const response = await api
                .post('/api/leagues')
                .send(newLeague)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
            expect(response.body).toEqual(newLeague)
        })
        it('returns 400 if id field is missing', async () => {
            const newLeague = {
                name: 'Serie A',
                base_country: 'Italy'
            }

            const response = await api
                .post('/api/leagues')
                .send(newLeague)
                .expect(400)

            expect(response.body).toEqual({ error: 'Missing required fields' })
        })
        it('returns 400 if name field is missing', async () => {
            const newLeague = {
                id: 52,
                base_country: 'Italy'
            }

            const response = await api
                .post('/api/leagues')
                .send(newLeague)
                .expect(400)

            expect(response.body).toEqual({ error: 'Missing required fields' })
        })
        it('returns 400 if base_country field is missing', async () => {
            const newLeague = {
                id: 52,
                name: 'Serie A'
            }

            const response = await api
                .post('/api/leagues')
                .send(newLeague)
                .expect(400)

            expect(response.body).toEqual({ error: 'Missing required fields' })
        })
        it('handles database errors correctly', async () => {
            jest.spyOn(leaguesRepo, 'insertLeague').mockRejectedValue(new Error('Failed to insert'))
            const newLeague = {
                id: 52,
                name: 'Serie A',
                base_country: 'Italy'
            }

            const response = await api
                .post('/api/leagues')
                .send(newLeague)
                .expect(500)

            expect(response.body).toEqual({ error: 'Failed to create league'})
        })
    })
})