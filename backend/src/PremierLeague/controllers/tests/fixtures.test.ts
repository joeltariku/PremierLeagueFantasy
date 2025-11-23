import { jest } from '@jest/globals'
import { PoolClient } from 'pg'
import { buildApp } from '../../../app.js'
import supertest from 'supertest'
import { NewSeason, Season } from '../../types/seasons.js'
import { League } from '../../types/league.js'
import { Team } from '../../types/teams.js'
import { Fixture } from '../../types/fixture.js'
import { conn } from '../../../utils/db.js'
import { makeTeamsRepo } from '../../repos/teamsRepo.js'
import { makeLeaguesRepo } from '../../repos/leaguesRepo.js'
import { makeSeasonsRepo } from '../../repos/seasonsRepo.js'
import { makeFixturesRepo } from '../../repos/fixturesRepo.js'

let client: PoolClient
let app: ReturnType<typeof buildApp>
let api: ReturnType<typeof supertest>

let teamsRepo: ReturnType<typeof makeTeamsRepo>
let leaguesRepo: ReturnType<typeof makeLeaguesRepo>
let seasonsRepo: ReturnType<typeof makeSeasonsRepo>
let fixturesRepo: ReturnType<typeof makeFixturesRepo>

const mockLeague: League = {
    id: 9,
    name: 'Premier League',
    base_country: 'England'
}

const mockNewSeason: NewSeason = {
    name: '2021/22',
    league_id: 9,
    start_date: '2021-08-15',
    end_date: '2022-05-22'
}

let mockSeason: Season

const mockTeams: Team[] = [
    {
        id: 1,
        name: 'mock-team-1',
        code: 'mt1',
        country: 'England'
    }, 
    {
        id: 2,
        name: 'mock-team-2',
        code: 'mt2',
        country: 'England'
    },
    {
        id: 3,
        name: 'mock-team-3',
        code: 'mt3',
        country: 'England'
    }, 
    {
        id: 4,
        name: 'mock-team-4',
        code: 'mt4',
        country: 'England'
    }
]

let mockFixtures: Fixture[]

describe('fixturesController', () => {
    beforeAll(async () => {
        const { rows } = await conn.query('SELECT current_database()')
        expect(rows[0].current_database).toBe('FantasyPL_Test')
    })
    beforeEach(async () => {
        client = await conn.connect()
        await client.query('BEGIN')
        // await client.query('TRUNCATE fixtures, teams, seasons, leagues RESTART IDENTITY CASCADE')
        await client.query('DELETE from fixtures')
        await client.query('DELETE from teams')
        await client.query('DELETE from seasons')
        await client.query('DELETE from leagues')

        leaguesRepo = makeLeaguesRepo(client)
        seasonsRepo = makeSeasonsRepo(client)
        teamsRepo = makeTeamsRepo(client)
        fixturesRepo = makeFixturesRepo(client)
        app = buildApp({
            db: client,
            leaguesRepo,
            seasonsRepo,
            teamsRepo,
            fixturesRepo
        })
        api = supertest(app)

        await leaguesRepo.insertLeague(mockLeague)
        mockSeason = await seasonsRepo.insertSeason(mockNewSeason)
        await teamsRepo.insertTeam(mockTeams[0])
        await teamsRepo.insertTeam(mockTeams[1])
        
        mockFixtures = [
            {
                id: 12,
                season_id: mockSeason.id,
                gameweek: 1,
                date: new Date('2021-08-13T19:00:00Z'),
                home_team_id: 1,
                away_team_id: 2,
                status: 'Scheduled',
                home_goals: 2,
                away_goals: 1
            },
            {
                id: 13,
                season_id: mockSeason.id,
                gameweek: 1,
                date: new Date('2021-08-14T19:00:00Z'),
                home_team_id: 3,
                away_team_id: 4,
                status: 'Match Finished',
                home_goals: 0,
                away_goals: 0
            }
        ]
        await fixturesRepo.insertFixture(mockFixtures[0])
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

    describe('GET /api/fixtures/:id', () => {
        it('returns 200 and the fixture if found', async () => {
            const response = await api.get('/api/fixtures/12')

            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                ...mockFixtures[0],
                date: mockFixtures[0].date.toISOString()
            })
        })
        it('returns 404 if fixture not found', async () => {
            const response = await api.get('/api/fixtures/999')

            expect(response.status).toBe(404)
            expect(response.body).toEqual({ error: 'Fixture with id=999 doesn\'t exist.' })
        })
        it('handles postgress specific errors properly', async () => {
            jest.spyOn(fixturesRepo, 'getFixtureById').mockRejectedValue({ code: '15032' })

            const response = await api.get('/api/fixtures/12')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixture. Postgres error code 15032.' })
        })
        it('handles errors with instanceof Error properly', async () => {
            jest.spyOn(fixturesRepo, 'getFixtureById').mockRejectedValue(new Error('Problem with your network connection.'))

            const response = await api.get('/api/fixtures/12')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixture. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(fixturesRepo, 'getFixtureById').mockRejectedValue({ error: 'Something unknown.' })

            const response = await api.get('/api/fixtures/12')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixture.' })
        })
    })
    describe('GET /api/fixtures/seasons/:seasonId', () => {
        it('returns 200 and the fixtures if found', async () => {
            const response = await api.get(`/api/fixtures/seasons/${mockSeason.id}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual([
                {
                    ...mockFixtures[0],
                    date: mockFixtures[0].date.toISOString()
                }
            ])
        })
        it('handles postgress specific errors properly', async () => {
            const response = await api.get(`/api/fixtures/seasons/string`)

            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixtures. Postgres error code 22P02.' })
        })
        it('handles errors with instanceof Error properly', async () => {
            jest.spyOn(fixturesRepo, 'getAllFixturesFromSeason').mockRejectedValue(new Error('Problem with your network connection.'))

            const response = await api.get(`/api/fixtures/seasons/${mockSeason.id}`)
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixtures. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(fixturesRepo, 'getAllFixturesFromSeason').mockRejectedValue({ error: 'Something unknown.' })

            const response = await api.get(`/api/fixtures/seasons/${mockSeason.id}`)
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixtures.' })
        })
    })
    describe('GET /api/fixtures/seasons/:seasonId/gameweek/:gameweekId', () => {
        it('returns 200 and the fixtures if found', async () => {
            const response = await api.get(`/api/fixtures/seasons/${mockSeason.id}/gameweek/1`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual([
                {
                    ...mockFixtures[0],
                    date: mockFixtures[0].date.toISOString()
                }
            ])
        })
        it('handles postgress specific errors properly', async () => {
            const response = await api.get(`/api/fixtures/seasons/string/gameweek/string`)

            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixtures. Postgres error code 22P02.' })
        })
        it('handles errors with instanceof Error properly', async () => {
            jest.spyOn(fixturesRepo, 'getFixturesFromSeasonGameweek').mockRejectedValue(new Error('Problem with your network connection.'))

            const response = await api.get(`/api/fixtures/seasons/${mockSeason.id}/gameweek/1`)
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixtures. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(fixturesRepo, 'getFixturesFromSeasonGameweek').mockRejectedValue({ error: 'Something unknown.' })

            const response = await api.get(`/api/fixtures/seasons/${mockSeason.id}/gameweek/1`)
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get fixtures.' })
        })
    })
    describe('POST /api/fixtures', () => {
        beforeEach(async () => {
            teamsRepo.insertTeam(mockTeams[2])
            teamsRepo.insertTeam(mockTeams[3])
        })
        it('returns 201 and the inserted fixture', async () => {

            const newFixture: Fixture = mockFixtures[1]
            const response = await api.post('/api/fixtures').send(newFixture)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                ...newFixture,
                date: newFixture.date.toISOString()
            })
        })
        it('returns 400 if required fields are missing', async () => {
            const response = await api.post('/api/fixtures').send({
                season_id: mockSeason.id,
                gameweek: 1,
                date: new Date('2021-08-14T19:00:00Z'),
                home_team_id: 3,
                away_team_id: 4,
                status: 'Match Finished',
                home_goals: 0,
                away_goals: 0
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Missing one or more required fields.' })
        })
        it('handles postgress specific errors properly', async () => {
            const response = await api.post('/api/fixtures').send({
                ...mockFixtures[1],
                season_id: 999
            })

            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to post fixture. Postgres error code 23503.' })
        })
        it('handles errors with instanceof Error properly', async () => {
            jest.spyOn(fixturesRepo, 'insertFixture').mockRejectedValue(new Error('Problem with your network connection.'))

            const response = await api.post('/api/fixtures').send(mockFixtures[1])
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to post fixture. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(fixturesRepo, 'insertFixture').mockRejectedValue({ error: 'Something unknown.' })

            const response = await api.post('/api/fixtures').send(mockFixtures[1])
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to post fixture.' })
        })
    })
    describe('PUT /api/fixtures/:id', () => {
        it('returns 200 and the updated fixture', async () => {
            const updatedData = {
                date: new Date('2021-08-15T19:00:00Z'),
                status: 'Match Finished',
                home_goals: 3,
                away_goals: 2
            }   

            const response = await api.put('/api/fixtures/12').send(updatedData)
            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                ...mockFixtures[0],
                ...updatedData,
                date: updatedData.date.toISOString()
            })
        })
        it('returns 404 if fixture not found', async () => {
            const response = await api.put('/api/fixtures/999').send({
                date: new Date('2021-08-15T19:00:00Z'),
                status: 'Match Finished',
                home_goals: 3,
                away_goals: 2
            })

            expect(response.status).toBe(404)
            expect(response.body).toEqual({ error: 'Fixture with id=999 doesn\'t exist.' })
        })
        it('returns 400 if required fields are missing', async () => {
            const response = await api.put('/api/fixtures/12').send({
                date: new Date('2021-08-15T19:00:00Z'),
                status: 'Match Finished',
                home_goals: 3
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Missing one or more required fields.' })
        })
        it('handles postgress specific errors properly', async () => {
            const response = await api.put('/api/fixtures/12').send({
                date: new Date('2021-08-15T19:00:00Z'),
                status: 'Match Finished',
                home_goals: 3,
                away_goals: 'two'
            })

            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to update fixture. Postgres error code 22P02.' })
        })
        it('handles errors with instanceof Error properly', async () => {
            jest.spyOn(fixturesRepo, 'updateFixture').mockRejectedValue(new Error('Problem with your network connection.'))

            const response = await api.put('/api/fixtures/12').send({
                date: new Date('2021-08-15T19:00:00Z'),
                status: 'Match Finished',
                home_goals: 3,
                away_goals: 2
            })
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to update fixture. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(fixturesRepo, 'updateFixture').mockRejectedValue({ error: 'Something unknown.' })

            const response = await api.put('/api/fixtures/12').send({
                date: new Date('2021-08-15T19:00:00Z'),
                status: 'Match Finished',
                home_goals: 3,
                away_goals: 2
            })
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to update fixture.' })
        })
    })
})