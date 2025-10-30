import { jest } from '@jest/globals'
import { Season } from '../../types/seasons'
import { conn } from '../../../utils/db'
import { QueryResult } from 'pg'
import { deleteSeasonByLeagueIdAndName, insertSeason } from '../seasonsService'

jest.mock('pg', () => ({
    Pool: jest.fn().mockImplementation(() => ({
        query: jest.fn()
    }))
}))

const mockSeasons: Season[] = [
    {
        id: 11,
        name: '2025/26',
        start_date: '2025-08-01',
        end_date: '2026-07-31',
        league_id: 39
    }
]

describe('Seasons Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(conn, 'query').mockResolvedValue({
            rows: mockSeasons,
            rowCount: mockSeasons.length
        } as QueryResult<Season>)
    })
    it('insertSeason is called with right query and returns first row', async () => {
        const mockSeason = mockSeasons[0]
        const result = await insertSeason(mockSeason)
        expect(conn.query).toHaveBeenCalledWith(
            'INSERT INTO seasons (name, start_date, end_date, league_id) VALUES ($1,$2,$3,$4) RETURNING *',
            [mockSeason.name, mockSeason.start_date, mockSeason.end_date, mockSeason.league_id]
        )
        expect(result).toEqual(mockSeasons[0])
    })
    it('deleteSeasonByLeagueIdAndName is called with right query and returns row count', async () => {
        const mockSeason = mockSeasons[0]
        const result = await deleteSeasonByLeagueIdAndName(mockSeason.name, mockSeason.league_id)
        expect(conn.query).toHaveBeenCalledWith(
            'DELETE FROM seasons WHERE league_id = $1 and name = $2',
            [mockSeason.league_id, mockSeason.name]
        )
        expect(result).toEqual(mockSeasons.length)
    })
})