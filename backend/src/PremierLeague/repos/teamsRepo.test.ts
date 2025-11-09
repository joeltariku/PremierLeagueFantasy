import { jest } from '@jest/globals'
import { QueryResult } from 'pg'
import { makeTeamsRepo } from './teamsRepo'
import { Team } from '../types/teams'

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockRepo = makeTeamsRepo(mockDB)
const mockTeams: Team[] = [
    {
        id: 1,
        name: 'Manchester United',
        code: 'MUN',
        country: 'England'
    },
    {
        id: 2,
        name: 'Liverpool',
        code: 'LIV',
        country: 'England'
    }
]

describe('teamsRepo', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDB.query.mockResolvedValue({
            rows: mockTeams,
            rowCount: mockTeams.length
        } as QueryResult<Team>)
    })
    describe('getAllTeams', () => {
        it('makes correct query and returns all rows', async () => {
            const result = await mockRepo.getAllTeams()
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM teams')
            expect(result).toEqual(mockTeams)
        })
    })
    describe('getTeamById', () => {
        it('makes correct query and returns first row', async () => {
            const result = await mockRepo.getTeamById(1)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM teams WHERE id = $1', [1])
            expect(result).toEqual(mockTeams[0])
        })
    })
    describe('insertTeam', () => {
        it('makes correct query and returns first row', async () => {
            const result = await mockRepo.insertTeam(mockTeams[0])
            expect(mockDB.query).toHaveBeenCalledWith(
                'INSERT INTO public.teams (id, name, code, country) VALUES ($1,$2,$3,$4) RETURNING *',
                [mockTeams[0].id, mockTeams[0].name, mockTeams[0].code, mockTeams[0].country]
            )
            expect(result).toEqual(mockTeams[0])
        })
    })
    describe('insertManyTeams', () => {
        it('only insert teams that do not exist and returns count of inserted teams', async () => {
            mockDB.query.mockResolvedValueOnce({
                rows: [] as Team[],
                rowCount: 0
            } as QueryResult<Team>)
            mockDB.query.mockResolvedValueOnce({
                rows: [mockTeams[0]] ,
                rowCount: 1
            } as QueryResult<Team>)
            mockDB.query.mockResolvedValueOnce({
                rows: [mockTeams[1]],
                rowCount: 1
            } as QueryResult<Team>)

            const result = await mockRepo.insertManyTeams(mockTeams)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM teams WHERE id = $1', [1])
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM teams WHERE id = $1', [2])
            expect(mockDB.query).toHaveBeenCalledWith(
                'INSERT INTO public.teams (id, name, code, country) VALUES ($1,$2,$3,$4) RETURNING *',
                [mockTeams[0].id, mockTeams[0].name, mockTeams[0].code, mockTeams[0].country]
            )
            expect(mockDB.query).not.toHaveBeenCalledWith(
                'INSERT INTO public.teams (id, name, code, country) VALUES ($1,$2,$3,$4) RETURNING *',
                [mockTeams[1].id, mockTeams[1].name, mockTeams[1].code, mockTeams[1].country]
            )
            expect(result).toEqual(1)
        })
        it('returns 0 if teams array is empty', async () => {
            const result = await mockRepo.insertManyTeams([])
            expect(result).toEqual(0)
            expect(mockDB.query).not.toHaveBeenCalled()
        })
    })

})