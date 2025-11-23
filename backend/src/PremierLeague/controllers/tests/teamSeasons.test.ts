import { jest } from '@jest/globals'
import { PoolClient } from 'pg'
import { buildApp } from '../../../app.js'
import supertest from 'supertest'
import { makeTeamsRepo } from '../../repos/teamsRepo.js'
import { makeSeasonsRepo } from '../../repos/seasonsRepo.js'
import { NewSeason, Season } from '../../types/seasons.js'
import { Team } from '../../types/teams.js'
import { conn } from '../../../utils/db.js'
import { makeTeamSeasonsRepo } from '../../repos/teamSeasonsRepo.js'
import { TeamSeason } from '../../types/teamSeason.js'
import { League } from '../../types/league.js'
import { makeLeaguesRepo } from '../../repos/leaguesRepo.js'

let client: PoolClient
let app: ReturnType<typeof buildApp>
let api: ReturnType<typeof supertest>

let teamsRepo: ReturnType<typeof makeTeamsRepo>
let seasonsRepo: ReturnType<typeof makeSeasonsRepo>
let teamSeasonsRepo: ReturnType<typeof makeTeamSeasonsRepo>
let leaguesRepo: ReturnType<typeof makeLeaguesRepo>

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

const mockTeam1: Team = {
    id: 1,
    name: 'mock-team-1',
    code: 'mt1',
    country: 'USA'
}

const mockTeam2: Team = {
    id: 2,
    name: 'mock-team-2',
    code: 'mt2',
    country: 'England'
}

let mockTeamSeason: TeamSeason


describe('teamSeasonsController', () => {
    beforeAll(async () => {
        const { rows } = await conn.query('SELECT current_database()')
        expect(rows[0].current_database).toBe('FantasyPL_Test')
    })
    beforeEach(async () => {
        client = await conn.connect()
        await client.query('BEGIN')
        await client.query('DELETE from team_seasons')
        await client.query('DELETE from teams')
        await client.query('DELETE from seasons')
        await client.query('DELETE from leagues')
        
        teamsRepo = makeTeamsRepo(client)
        seasonsRepo = makeSeasonsRepo(client)
        teamSeasonsRepo = makeTeamSeasonsRepo(client)
        leaguesRepo = makeLeaguesRepo(client)
        app = buildApp({
            db: client,
            teamsRepo,
            seasonsRepo,
            teamSeasonsRepo,
            leaguesRepo
        })
        api = supertest(app)

        await leaguesRepo.insertLeague(mockLeague)
        await teamsRepo.insertTeam(mockTeam1)
        await teamsRepo.insertTeam(mockTeam2)

        mockSeason = await seasonsRepo.insertSeason(mockNewSeason)
        mockTeamSeason = {
            season_id: mockSeason.id,
            team_id: mockTeam1.id,
            points: 99,
            rank: 1,
            goals_scored: 83,
            goals_conceded: 33,
        }
        await teamSeasonsRepo.insertTeamSeason(mockTeamSeason)
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

    describe('GET /api/teamSeasons/seasons/:seasonId/teams/:teamId', () => {
        it('returns 200 and the teamSeason if found', async () => {
            const { season_id, team_id } = mockTeamSeason
            const response = await api.get(`/api/teamSeasons/seasons/${season_id}/teams/${team_id}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockTeamSeason)
        })
        it('returns 404 if teamSeason not found', async () => {
            const response = await api.get('/api/teamSeasons/seasons/999/teams/999')

            expect(response.status).toBe(404)
            expect(response.body).toEqual({ error: 'Team season with season_id=999 and team_id=999 doesn\'t exist.' })
        })
        it('handles postgress specific errors properly', async () => {
            jest.spyOn(teamSeasonsRepo, 'getTeamSeasonBySeasonIdAndTeamId').mockRejectedValue({ code: '15032' })

            const response = await api.get('/api/teamSeasons/seasons/999/teams/999')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get teamSeason. Postgres error code 15032.' })
        })
        it('handles errors with instanceof Error properly', async () => {
            jest.spyOn(teamSeasonsRepo, 'getTeamSeasonBySeasonIdAndTeamId').mockRejectedValue(new Error('Problem with your network connection.'))

            const response = await api.get('/api/teamSeasons/seasons/999/teams/999')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get teamSeason. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(teamSeasonsRepo, 'getTeamSeasonBySeasonIdAndTeamId').mockRejectedValue({ error: 'Something unknown.' })

            const response = await api.get('/api/teamSeasons/seasons/999/teams/999')
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to get teamSeason.' })
        })
    })
    describe('POST /api/teamSeasons', () => {
        it('returns 201 and the inserted teamSeason', async () => {
            const newTeamSeason = {
                season_id: mockSeason.id,
                team_id: mockTeam2.id,
                points: 88,
                rank: 2,
                goals_scored: 70,
                goals_conceded: 40
            }
            const response = await api.post('/api/teamSeasons').send(newTeamSeason)
            expect(response.status).toBe(201)
            expect(response.body).toEqual(newTeamSeason)
        })
        it('returns 201 when points, goals_scored, and goals_conceded are 0', async () => {
            const newTeamSeason = {
                season_id: mockSeason.id,
                team_id: mockTeam2.id,
                points: 0,
                rank: 20,
                goals_scored: 0,
                goals_conceded: 0
            }

            const response = await api.post('/api/teamSeasons').send(newTeamSeason)
            expect(response.status).toBe(201)
            expect(response.body).toEqual(newTeamSeason)
        })
        it('returns 400 if any required field is missing', async () => {
            const newTeamSeason = {
                season_id: mockSeason.id,
                team_id: mockTeam2.id,
                points: 88,
                rank: 2,
                goals_scored: 70
            }
            const response = await api.post('/api/teamSeasons').send(newTeamSeason)
            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Missing one or more required fields.' })
        })
        it('returns 500 for invalid numeric values', async () => {
            const newTeamSeason = {
                season_id: mockSeason.id,
                team_id: mockTeam2.id,
                points: 'eighty-eight',
                rank: 2,
                goals_scored: 70,
                goals_conceded: 40
            }
            const response = await api.post('/api/teamSeasons').send(newTeamSeason)
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to post teamSeason. Postgres error code 22P02.' })
        })
        it('handles generic errors properly', async () => {
            jest.spyOn(teamSeasonsRepo, 'insertTeamSeason').mockRejectedValue(new Error('Database connection lost.'))

            const newTeamSeason = {
                season_id: mockSeason.id,
                team_id: mockTeam2.id,
                points: 88,
                rank: 2,
                goals_scored: 70,
                goals_conceded: 40
            }

            const response = await api.post('/api/teamSeasons').send(newTeamSeason)
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to post teamSeason. Database connection lost.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(teamSeasonsRepo, 'insertTeamSeason').mockRejectedValue({ error: 'Something unknown.' })

            const newTeamSeason = {
                season_id: mockSeason.id,
                team_id: mockTeam2.id,
                points: 88,
                rank: 2,
                goals_scored: 70,
                goals_conceded: 40
            }

            const response = await api.post('/api/teamSeasons').send(newTeamSeason)
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ error: 'Failed to post teamSeason.' })
        })
    })
})