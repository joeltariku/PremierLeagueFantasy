import { jest } from "@jest/globals"
import { QueryResult } from "pg"
import { Season } from "../types/seasons"
import { makeSeasonsRepo } from "./seasonsRepo"

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockRepo = makeSeasonsRepo(mockDB)
const mockSeasons: Season[] = [
    {
        id: 8,
        name: '2024/25',
        start_date: new Date('2024-08-17'),
        end_date: new Date('2025-05-26'),
        league_id: 39
    },
    {
        id: 10,
        name: '2025/26',
        start_date: new Date('2025-08-16'),
        end_date: new Date('2026-05-25'),
        league_id: 39
    }
]

describe('seasonsRepo', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDB.query.mockResolvedValue({
            rows: mockSeasons,
            rowCount: mockSeasons.length
        } as QueryResult<Season>)
    })
    describe('insertSeason', () => {
        it('calls query with correct arguments and returns first row', async() => {
            const { id, ...rest } = mockSeasons[0]
            const result = await mockRepo.insertSeason(rest)
            expect(mockDB.query).toHaveBeenCalledWith(
                'INSERT INTO seasons (name, start_date, end_date, league_id) VALUES ($1,$2,$3,$4) RETURNING *',
                [rest.name, rest.start_date, rest.end_date, rest.league_id]
            )
            expect(result).toEqual(mockSeasons[0])
        })
    })
    describe('deleteSeasonByLeagueIdAndName', () => {
        it('calls query with correct arguments and returns row count', async() => {
            mockDB.query.mockResolvedValue({
                rows: [mockSeasons[0]],
                rowCount: 1
            } as QueryResult<Season>)
            const result = await mockRepo.deleteSeasonByLeagueIdAndName(mockSeasons[0].name, mockSeasons[0].league_id)
            expect(mockDB.query).toHaveBeenCalledWith(
                'DELETE FROM seasons WHERE league_id = $1 and name = $2',
                [mockSeasons[0].league_id, mockSeasons[0].name]
            )
            expect(result).toEqual(1)
        })
    })
    describe('getSeasonById', () => {
        it('calls query with correct arguments and returns first row', async () => {
            const result = await mockRepo.getSeasonById(8)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM seasons WHERE id = $1', [8])
            expect(result).toEqual(mockSeasons[0])
        })
        it('returns undefined if no season found', async () => {
            mockDB.query.mockResolvedValue({
                rows: [] as Season[],
                rowCount: 0
            } as QueryResult<Season>)
            const result = await mockRepo.getSeasonById(8)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM seasons WHERE id = $1', [8])
            expect(result).toEqual(undefined)
        })
    })
})