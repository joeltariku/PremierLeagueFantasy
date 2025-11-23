import supertest from "supertest"
import { buildApp } from "../../../app.js"
import { conn } from "../../../utils/db.js"
import { NewSeason, Season } from "../../types/seasons.js"
import { makeLeaguesRepo } from "../../repos/leaguesRepo.js"
import { League } from "../../types/league.js"
import { PoolClient } from "pg"
import { makeSeasonsRepo } from "../../repos/seasonsRepo.js"

let app: ReturnType<typeof buildApp>
let api: ReturnType<typeof supertest>
let client: PoolClient
let seasonsRepo: ReturnType<typeof makeSeasonsRepo>
let leaguesRepo: ReturnType<typeof makeLeaguesRepo>

const mockNewSeasons: NewSeason[] = [
    {
        name: '2021/22',
        league_id: 9,
        start_date: '2021-08-15',
        end_date: '2022-05-22'
    },
    {
        name: '2022/23',
        league_id: 9,
        start_date: '2022-08-12',
        end_date: '2023-05-18'
    }
]

let mockSeason1: Season
let mockSeason2: Season

const mockLeague: League = {
    id: 9,
    name: 'Premier League',
    base_country: 'England'
}



describe('seasonsController', () => {
    beforeAll(async () => {
        const { rows } = await conn.query('SELECT current_database()')
        expect(rows[0].current_database).toBe('FantasyPL_Test')
    })
    beforeEach(async () => {
        client = await conn.connect()
        await client.query('BEGIN')
        await client.query('DELETE from seasons')
        await client.query('DELETE from leagues')

        leaguesRepo = makeLeaguesRepo(client)
        seasonsRepo = makeSeasonsRepo(client)

        app = buildApp({
            db: client,
            leaguesRepo,
            seasonsRepo
        })
        api = supertest(app)

        await leaguesRepo.insertLeague(mockLeague)
        mockSeason1 = await seasonsRepo.insertSeason(mockNewSeasons[0])
        mockSeason2 = await seasonsRepo.insertSeason(mockNewSeasons[1])
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
    describe('GET /api/seasons/:id', () => {
        it('returns json', async () => {
            await api
                .get('/api/seasons/1')
                .expect('Content-Type', /application\/json/)
        })
        it('returns season for existing id', async () => {
            const { id } = mockSeason1
            const result = await api.get(`/api/seasons/${id}`)
            
            expect(result.status).toBe(200)
            expect(result.body).toEqual({
                ...mockSeason1,
                start_date: mockSeason1.start_date,
                end_date: mockSeason1.end_date
            })
        })
        it('returns 404 if season isn\'t found', async () => {
            const result = await api.get('/api/seasons/19')

            expect(result.status).toBe(404)
            expect(result.body).toEqual({ error: 'Season with id=19 doesn\'t exist' })
        })
        it('handles postgress specific errors properly', async () => {
            jest.spyOn(seasonsRepo, 'getSeasonById').mockRejectedValue({ detail: 'Something is wrong.' })

            const result = await api.get('/api/seasons/1')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get season. Something is wrong.' })
        })
        it('handles errors with instanceof "Error" properly', async () => {
            jest.spyOn(seasonsRepo, 'getSeasonById').mockRejectedValue(new Error('Problem with your network connection.'))

            const result = await api.get('/api/seasons/1')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get season. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(seasonsRepo, 'getSeasonById').mockRejectedValue({ error: 'Something unknown.'})

            const result = await api.get('/api/seasons/1')
            expect(result.status).toBe(500)
            expect(result.body).toEqual({ error: 'Failed to get season.' })
        })
    })
    describe('POST /api/seasons', () => {
        it('creates new season when all required fields are included', async () => {
            const newSeason: NewSeason = {
                name: '2027/28',
                league_id: 9,
                start_date: '2027-08-21',
                end_date: '2028-05-20'
            }

            const result = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(201)
                .expect('Content-type', /application\/json/)

            expect(result.body).toEqual({
                ...newSeason,
                id: expect.any(Number),
            })
            const res = await api.get(`/api/seasons/${result.body.id}`)
            expect(res.body).toEqual({
                ...newSeason,
                id: expect.any(Number)
            })
        })
        it('returns 400 if name is missing', async () => {
            const newSeason = {
                league_id: 9,
                start_date: '2027-08-21',
                end_date: '2028-05-20'
            }

            const response = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(400)
            
            expect(response.body).toEqual({ error: 'Missing required fields.' })
        })
        it('returns 400 if league_id is missing', async () => {
            const newSeason = {
                name: '2027/28',
                start_date: '2027-08-21',
                end_date: '2028-05-20'
            }

            const response = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(400)
            
            expect(response.body).toEqual({ error: 'Missing required fields.' })
        })
        it('returns 400 if start_date is missing', async () => {
            const newSeason = {
                league_id: 9,
                name: '2027/28',
                end_date: '2028-05-20'
            }

            const response = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(400)
            
            expect(response.body).toEqual({ error: 'Missing required fields.' })
        })
        it('returns 400 if end_date is missing', async () => {
            const newSeason = {
                league_id: 9,
                name: '2027/28',
                start_date: '2027-08-21',
            }

            const response = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(400)
            
            expect(response.body).toEqual({ error: 'Missing required fields.' })
        })
        it('handles postgress specific errors properly', async () => {
            jest.spyOn(seasonsRepo, 'insertSeason').mockRejectedValue({ detail: 'Something is wrong.' })

            const newSeason: NewSeason = {
                name: '2027/28',
                league_id: 9,
                start_date: '2027-08-21',
                end_date: '2028-05-20'
            }

            const response = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(500)

            expect(response.body).toEqual({ error: 'Failed to post season. Something is wrong.' })
        })
        it('handles errors with instanceof "Error" properly', async () => {
            jest.spyOn(seasonsRepo, 'insertSeason').mockRejectedValue(new Error('Problem with your network connection.'))

            const newSeason: NewSeason = {
                name: '2027/28',
                league_id: 9,
                start_date: '2027-08-21',
                end_date: '2028-05-20'
            }

            const response = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(500)

            expect(response.body).toEqual({ error: 'Failed to post season. Problem with your network connection.' })
        })
        it('handles unknown errors properly', async () => {
            jest.spyOn(seasonsRepo, 'insertSeason').mockRejectedValue({ error: 'Something unknown.'})

            const newSeason: NewSeason = {
                name: '2027/28',
                league_id: 9,
                start_date: '2027-08-21',
                end_date: '2028-05-20'
            }

            const response = await api    
                .post('/api/seasons')
                .send(newSeason)
                .expect(500)

            expect(response.body).toEqual({ error: 'Failed to post season.' })
        })
    })
})