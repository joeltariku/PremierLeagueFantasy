import supertest from "supertest";
import  { buildApp } from "../../../app.js";
import { conn } from "../../../utils/db.js";
import { Team } from "../../types/teams.js";
import { jest } from "@jest/globals";
import { makeTeamsRepo } from "../../repos/teamsRepo.js";
import { PoolClient } from "pg";

let app: ReturnType<typeof buildApp>
let api: ReturnType<typeof supertest>
let client: PoolClient

let teamsRepo: ReturnType<typeof makeTeamsRepo>

const mockTeams: Team[] = [
    {
        id: 1,
        name: 'mock-team-1',
        code: 'mt1',
        country: 'USA'
    }, 
    {
        id: 2,
        name: 'mock-team-2',
        code: 'mt2',
        country: 'USA'
    },
    {
        id: 3,
        name: 'mock-team-3',
        code: 'mt3',
        country: 'England'
    }
]

let mockTeam1
let mockTeam2
let mockTeam3

describe('teamsController', () => {
    beforeAll(async () => {
        const { rows } = await conn.query('SELECT current_database()')
        expect(rows[0].current_database).toBe('FantasyPL_Test')
        await conn.query('TRUNCATE teams RESTART IDENTITY CASCADE')
    })
    beforeEach(async () => {
        client = await conn.connect()
        await client.query('BEGIN')

        teamsRepo = makeTeamsRepo(client)
        app = buildApp({
            db: client,
            teamsRepo
        })
        api = supertest(app)
        
        mockTeam1 = await teamsRepo.insertTeam(mockTeams[0])
        mockTeam2 = await teamsRepo.insertTeam(mockTeams[1])
        mockTeam3 = await teamsRepo.insertTeam(mockTeams[2])
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
    describe('GET /api/teams', () => {
        it('teams are returned as json', async () => {
            await api
                .get('/api/leagues')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
        it('returns all teams in the database', async () => {
            const result = await api.get('/api/teams')

            expect(result.body).toHaveLength(mockTeams.length)
            for (let i = 0; i < mockTeams.length; i++) {
                expect(result.body[i]).toEqual(mockTeams[i])
            }
        })
        it('handles postgress specific errors properly', async () => {
            jest.spyOn(teamsRepo, 'getAllTeams').mockRejectedValue({ detail: 'Something is wrong.' })

            const result = await api.get('/api/teams')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get teams. Something is wrong.' })
        })
        it('handles errors with instanceof "Error" properly', async () => {
            jest.spyOn(teamsRepo, 'getAllTeams').mockRejectedValue(new Error('Problem with your network connection.'))

            const result = await api.get('/api/teams')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get teams. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(teamsRepo, 'getAllTeams').mockRejectedValue({ error: 'Something unknown.'})

            const result = await api.get('/api/teams')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get teams.' })
        })
    })
    describe('GET /api/teams/:id', () => {
        it('team is returned as json', async () => {
            await api
                .get('/api/teams/1')
                .expect('Content-Type', /application\/json/)
        })    
        it('returns the team with correct id', async () => {
            const result = await api.get('/api/teams/2')

            expect(result.status).toBe(200)
            expect(result.body).toEqual(mockTeams[1])
        })
        it('returns 404 if team is not found', async () => {
            const result = await api.get('/api/teams/10')

            expect(result.status).toBe(404)
            expect(result.body).toEqual({ error: 'Team with id=10 doesn\'t exist.'})
        })
        it('handles postgress specific errors properly', async () => {
            jest.spyOn(teamsRepo, 'getTeamById').mockRejectedValue({ detail: 'Something is wrong.' })

            const result = await api.get('/api/teams/1')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get team. Something is wrong.' })
        })
        it('handles errors with instanceof "Error" properly', async () => {
            jest.spyOn(teamsRepo, 'getTeamById').mockRejectedValue(new Error('Problem with your network connection.'))

            const result = await api.get('/api/teams/1')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get team. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(teamsRepo, 'getTeamById').mockRejectedValue({ error: 'Something unknown.'})

            const result = await api.get('/api/teams/1')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get team.' })
        })
    }) 
    describe('POST /api/teams', () => {
        it('creates a new team when all required fields are included', async () => {
            const newTeam = {
                id: 4,
                name: 'mock-team-4',
                code: 'mt4',
                country: 'Italy'
            }

            const result = await api
                .post('/api/teams')
                .send(newTeam)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            expect(result.body).toEqual(newTeam)

            const updatedTeams = await api.get('/api/teams')
            expect(updatedTeams.body).toHaveLength(mockTeams.length + 1)
        })
        it('returns 400 if id field is missing', async () => {
            const newTeam = {
                name: 'mock-team-4',
                code: 'mt4',
                country: 'Italy'
            }

            const result = await api
                .post('/api/teams')
                .send(newTeam)
                .expect(400)

            expect(result.body).toEqual({ error: 'Missing required fields.'})
        })
        it('returns 400 if name field is missing', async () => {
            const newTeam = {
                id: 4,
                code: 'mt4',
                country: 'Italy'
            }

            const result = await api
                .post('/api/teams')
                .send(newTeam)
                .expect(400)

            expect(result.body).toEqual({ error: 'Missing required fields.'})
        })
        it('returns 400 if code field is missing', async () => {
            const newTeam = {
                id: 4,
                name: 'mock-team-4',
                country: 'Italy'
            }

            const result = await api
                .post('/api/teams')
                .send(newTeam)
                .expect(400)

            expect(result.body).toEqual({ error: 'Missing required fields.'})
        })
        it('returns 400 if country field is missing', async () => {
            const newTeam = {
                id: 4,
                name: 'mock-team-4',
                code: 'mt4'
            }

            const result = await api
                .post('/api/teams')
                .send(newTeam)
                .expect(400)

            expect(result.body).toEqual({ error: 'Missing required fields.'})
        })
        it('handles postgress specific errors properly', async () => {
            jest.spyOn(teamsRepo, 'insertTeam').mockRejectedValue({ detail: 'Something is wrong.' })
            const newTeam = {
                id: 4,
                name: 'mock-team-4',
                code: 'mt4',
                country: 'Italy'
            }

            const result = await api.post('/api/teams').send(newTeam)
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to post team. Something is wrong.' })
        })
        it('handles errors with instanceof "Error" properly', async () => {
            jest.spyOn(teamsRepo, 'insertTeam').mockRejectedValue(new Error('Problem with your network connection.'))
            const newTeam = {
                id: 4,
                name: 'mock-team-4',
                code: 'mt4',
                country: 'Italy'
            }

            const result = await api.post('/api/teams').send(newTeam)
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to post team. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(teamsRepo, 'insertTeam').mockRejectedValue({ error: 'Something unknown.'})
            const newTeam = {
                id: 4,
                name: 'mock-team-4',
                code: 'mt4',
                country: 'Italy'
            }

            const result = await api.post('/api/teams').send(newTeam)
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to post team.' })
        })
    })
})