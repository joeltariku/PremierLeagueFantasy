import { jest } from "@jest/globals";
import { QueryResult } from "pg";
import { Position } from "../../types/position.js";
import { makePositionsRepo } from "../positionsRepo.js";

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockRepo = makePositionsRepo(mockDB)

const mockPositionsArray: Position[] = [
    { code: 'GK', name: 'Goalkeeper' }
]

describe('positionsRepo', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDB.query.mockResolvedValue({
            rows: mockPositionsArray,
            rowCount: mockPositionsArray.length
        } as QueryResult<Position>)
    })
    describe('getPositionByCode', () => {
        it('should make correct query and return first row', async () => {
            const result = await mockRepo.getPositionByCode('GK')

            expect(mockDB.query).toHaveBeenCalledWith(
                'SELECT name FROM positions WHERE code = $1',
                ['GK']
            )
            expect(result).toEqual(mockPositionsArray[0])
        })
    })
})