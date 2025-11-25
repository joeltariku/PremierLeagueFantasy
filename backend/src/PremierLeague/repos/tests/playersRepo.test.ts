import { jest } from '@jest/globals';
import { QueryResult } from 'pg';
import { makePlayersRepo } from '../playersRepo.js';
import { Player } from '../../types/player.js';

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockRepo = makePlayersRepo(mockDB)

const mockPlayersArray: Player[] = [
    {
        id: 1,
        team_id: 10,
        position_code: 'ATT',
        first_name: 'John',
        last_name: 'Doe',
        display_name: 'J. Doe',
        dob: '1990-01-01'
    }
]

describe('playersRepo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDB.query.mockResolvedValue({
            rows: mockPlayersArray,
            rowCount: mockPlayersArray.length,
        } as QueryResult<Player>)
    })
    describe('getPlayerById', () => {
        it('makes correct query and returns first index of rows', async () => {
            const playerId = mockPlayersArray[0].id
            const player = await mockRepo.getPlayerById(playerId)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM players WHERE id = $1', [playerId])
            expect(player).toEqual(mockPlayersArray[0])
        })
    })
    describe('getPlayersByTeamId', () => {
        it('makes correct query and returns rows of players', async () => {
            const teamId = mockPlayersArray[0].team_id
            const players = await mockRepo.getPlayersByTeamId(teamId)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM players WHERE team_id = $1', [teamId])
            expect(players).toEqual(mockPlayersArray)
        })
    })
    describe('insertPlayer', () => {
        it('makes correct query and returns inserted player', async () => {
            const playerToInsert = mockPlayersArray[0]
            const insertedPlayer = await mockRepo.insertPlayer(playerToInsert)
            expect(mockDB.query).toHaveBeenCalledWith( 'INSERT INTO players (id, team_id, position_code, first_name, last_name, display_name, dob) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
                [playerToInsert.id, playerToInsert.team_id, playerToInsert.position_code, playerToInsert.first_name, playerToInsert.last_name, playerToInsert.display_name, playerToInsert.dob]
            )
            expect(insertedPlayer).toEqual(playerToInsert)
        })
    })
})