import { beforeEach, describe, expect, jest } from '@jest/globals'
import { QueryResult } from "pg";
import { getAllLeagues, getLeagueById, insertLeague, deleteLeagueById, deleteAllLeagues, conn } from '../leagueService';
import { League } from '../../types/league';

jest.mock('pg', () => ({
    Pool: jest.fn().mockImplementation(() => ({
        query: jest.fn(),
        end: jest.fn()
    }))
}))

const mockRows = [
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

describe('League Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(conn, 'query').mockResolvedValue({
            rows: mockRows,
            rowCount: mockRows.length
        } as QueryResult<League>)
    });

    it('getAllLeagues is called with the right query and returns all rows', async () => {
        const result = await getAllLeagues()
        expect(conn.query).toHaveBeenCalledWith('SELECT * FROM leagues')
        expect(result).toBe(mockRows)
    })
    it('getLeagueById is called with the right query and returns first row', async () => {
        const result = await getLeagueById(39)
        expect(conn.query).toHaveBeenCalledWith('SELECT * FROM leagues WHERE id = $1', [39])
        expect(result).toEqual(mockRows[0])
    })
    it('insertLeague is called with right query and returns first row', async () => {
        const result = await insertLeague(mockRows[1])
        expect(conn.query).toHaveBeenCalledWith(
            'INSERT INTO leagues (id, name, base_country) VALUES ($1,$2,$3) RETURNING *', 
            [40, 'La Liga', 'Spain'])
        expect(result).toBe(mockRows[0])
    })
    it('deleteLeagueById is called with right query and returns row count', async () => {
        const result = await deleteLeagueById(39)
        expect(conn.query).toHaveBeenCalledWith(
            'DELETE FROM leagues WHERE id = $1',
            [39]
        )
        expect(result).toBe(mockRows.length)
    })
    it('deleteAllLeagues is called with right query and returns row count', async () => {
        const result = await deleteAllLeagues()
        expect(conn.query).toHaveBeenCalledWith('DELETE FROM leagues')
        expect(result).toBe(mockRows.length)
    })
});