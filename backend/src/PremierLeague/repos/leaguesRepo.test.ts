import { jest } from '@jest/globals'
import { QueryResult } from "pg";
import { makeLeaguesRepo } from './leaguesRepo';
import { League } from '../types/league';

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockRepo = makeLeaguesRepo(mockDB)
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

describe('leaguesRepo', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDB.query.mockResolvedValue({
            rows: mockLeagues,
            rowCount: mockLeagues.length
        } as QueryResult<League>)
    })
    describe('getAllLeagues', () => {
        it('makes correct query and returns all rows', async () => {
            const result = await mockRepo.getAllLeagues()
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM leagues')
            expect(result).toEqual(mockLeagues)
        })
    })
    describe('getLeagueById', () => {
        it('makes correct query and returns first row', async () => {
            const result = await mockRepo.getLeagueById(39)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM leagues WHERE id = $1', [39])
            expect(result).toEqual(mockLeagues[0])
        })
    })  
    describe('insertLeague', () => {
        it('makes correct query and returns first row', async () => {
            const result = await mockRepo.insertLeague(mockLeagues[0])
            expect(mockDB.query).toHaveBeenCalledWith(
                'INSERT INTO leagues (id, name, base_country) VALUES ($1,$2,$3) RETURNING *',
                [mockLeagues[0].id, mockLeagues[0].name, mockLeagues[0].base_country]
            )
            expect(result).toEqual(mockLeagues[0])
        })
    })
    describe('deleteLeagueById', () => {
        it('makes correct query and returns row count', async () => {
            mockDB.query.mockResolvedValue({
                rows: [mockLeagues[0]],
                rowCount: 1
            } as QueryResult<League>)
            const result = await mockRepo.deleteLeagueById(39)
            expect(mockDB.query).toHaveBeenCalledWith('DELETE FROM leagues WHERE id = $1', [39])
            expect(result).toEqual(1)
        })
    })
    describe('deleteAllLeagues', () => {
        it('makes correct query and returns row count', async () => {
            const result = await mockRepo.deleteAllLeagues()
            expect(mockDB.query).toHaveBeenCalledWith('DELETE FROM leagues')
            expect(result).toEqual(2)
        })
    })
})