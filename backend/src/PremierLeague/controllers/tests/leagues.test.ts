import { jest } from '@jest/globals'
import { conn } from '../../../utils/db.js'
import supertest from 'supertest'
import { League } from '../../types/league.js'
import { makeLeaguesRepo } from '../../repos/leaguesRepo.js'
import { PoolClient } from 'pg'
import { buildApp } from '../../../app.js'

let app: ReturnType<typeof buildApp>
let api: ReturnType<typeof supertest>
let client: PoolClient

let leaguesRepo: ReturnType<typeof makeLeaguesRepo>

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
        await conn.query('TRUNCATE leagues RESTART IDENTITY CASCADE')
    })
    beforeEach(async () => {
        client = await conn.connect()
        await client.query('BEGIN')

        leaguesRepo = makeLeaguesRepo(client)
        app = buildApp({
            db: client,
            leaguesRepo
        })
        api = supertest(app)

        await leaguesRepo.insertLeague(mockLeagues[0])
        await leaguesRepo.insertLeague(mockLeagues[1])
    })
    afterEach(async () => {
        await client.query('ROLLBACK')
        client.release()
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
    describe('DELETE /api/leagues', () => {
        it('result is json', async () => {
            await api
                .delete('/api/leagues')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
        it('successfully deletes all leagues', async () => {
            const result = await api.delete('/api/leagues')
            expect(result.body).toEqual('Deleted 2 leagues')

            const leaguesResponse = await api.get('/api/leagues')
            expect(leaguesResponse.body).toHaveLength(0)
        })
        it('handles deletion error where other tables have rows referencing one of the leagues', async () => {
            jest.spyOn(leaguesRepo, 'deleteAllLeagues').mockRejectedValue({ detail: 'Key (id)=(39) is still referenced from table "seasons".' })

            const result = await api.delete('/api/leagues')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to delete leagues. Key (id)=(39) is still referenced from table "seasons".'})
        })
        it('handles deletion error that is an instance of Error', async () => {
            jest.spyOn(leaguesRepo, 'deleteAllLeagues').mockRejectedValue(new Error('Could not connect to database'))

            const result = await api.delete('/api/leagues')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to delete leagues. Could not connect to database' })
        })
        it('handles deletion error that is an instance of Error', async () => {
            jest.spyOn(leaguesRepo, 'deleteAllLeagues').mockRejectedValue({ error: 'Something unknown'})

            const result = await api.delete('/api/leagues')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'An unknown error occurred.' })
        })
    })
    describe('DELETE /api/leagues/:id', () => {
        it('result is json', async () => {
            await api
                .delete('/api/leagues/39')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
        it('successfully deletes league with if it exists', async () => {
            const result = await api.delete('/api/leagues/39')
            expect(result.body).toEqual('Deleted league with id=39')

            const leaguesResponse = await api.get('/api/leagues')
            expect(leaguesResponse.body).toHaveLength(1)
        })
        it('if no league with the id exists then response shares that information', async () => {
            const result = await api.delete('/api/leagues/12')
            expect(result.body).toEqual('No league exists with id=12')

            const leaguesResponse = await api.get('/api/leagues')
            expect(leaguesResponse.body).toHaveLength(2)
        })
        it('handles deletion error where other tables have rows referencing the league', async () => {
            jest.spyOn(leaguesRepo, 'deleteLeagueById').mockRejectedValue({ detail: 'Key (id)=(39) is still referenced from table "seasons".' })

            const result = await api.delete('/api/leagues/39')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to delete league. Key (id)=(39) is still referenced from table "seasons".'})
        })
        it('handles deletion error that is an instance of Error', async () => {
            jest.spyOn(leaguesRepo, 'deleteLeagueById').mockRejectedValue(new Error('Could not connect to database'))

            const result = await api.delete('/api/leagues/39')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to delete league. Could not connect to database' })
        })
        it('handles deletion error that is an instance of Error', async () => {
            jest.spyOn(leaguesRepo, 'deleteLeagueById').mockRejectedValue({ error: 'Something unknown'})

            const result = await api.delete('/api/leagues/39')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'An unknown error occurred.' })
        })
    })
})