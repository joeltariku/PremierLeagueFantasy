import { jest } from '@jest/globals';
import { QueryResult } from 'pg';
import { makePlayersService } from '../playersService.js';
import { Player } from '../../types/player.js';
import { makePlayersRepo } from '../../repos/playersRepo.js';
import { makeTeamSeasonsRepo } from '../../repos/teamSeasonsRepo.js';
import { APIPlayer, APIPlayerProfile } from '../../types/API-Football/players.js';
import { getAPIPlayerInfoFromId, getAPIPlayersFromTeamSeason } from '../../../api-clients/playersClient.js';
import { get } from 'mongoose';

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockPlayersRepo = makePlayersRepo(mockDB)
const mockTeamSeasonsRepo = makeTeamSeasonsRepo(mockDB)

const mockAPIPlayers: APIPlayer[] = [
    {
        player: {
            id: 1
        }
    } as APIPlayer,
    {
        player: {
            id: 2
        }
    } as APIPlayer
]

const mockAPIPlayerProfiles: APIPlayerProfile[] = [
    {
        player: {
            id: 1,
            position: 'Midfielder',
            firstname: 'Alice',
            lastname: 'Smith',
            name: 'A. Smith',
            birth: {
                date: '1992-02-02'
            }
        }
    } as APIPlayerProfile, 
    {
        player: {
            id: 2,
            position: 'Attacker',
            firstname: 'Bob',
            lastname: 'Johnson',
            name: 'B. Johnson',
            birth: {
                date: '1993-03-03'
            }
        }
    } as APIPlayerProfile
]

const mockPlayers: Player[] = [
    {
        id: 1,
        team_id: 10,
        position_code: 'MID',
        first_name: 'Alice',
        last_name: 'Smith',
        display_name: 'A. Smith',
        dob: '1992-02-02'
    }, 
    {
        id: 2,
        team_id: 10,
        position_code: 'ATT',
        first_name: 'Bob',
        last_name: 'Johnson',
        display_name: 'B. Johnson',
        dob: '1993-03-03'
    }
]

const mockGetAPIPlayersFromTeamSeason = jest.fn<typeof getAPIPlayersFromTeamSeason>()
const mockGetAPIPlayerInfoFromId = jest.fn<typeof getAPIPlayerInfoFromId>()

const mockService = makePlayersService({
    playersRepo: mockPlayersRepo,
    teamSeasonsRepo: mockTeamSeasonsRepo,
    getAPIPlayersFromTeamSeason: mockGetAPIPlayersFromTeamSeason,
    getAPIPlayerInfoFromId: mockGetAPIPlayerInfoFromId
})

describe('playersService', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })
    describe('addPlayersForTeamSeason', () => {
        it('should add players for a team season and return count of added players', async () => {
            jest.spyOn(mockPlayersRepo, 'insertPlayer').mockResolvedValueOnce(mockPlayers[0]).mockResolvedValueOnce(undefined)
            mockGetAPIPlayersFromTeamSeason.mockResolvedValueOnce(mockAPIPlayers)
            mockGetAPIPlayerInfoFromId.mockResolvedValueOnce(mockAPIPlayerProfiles[0]).mockResolvedValueOnce(mockAPIPlayerProfiles[1])

            const count = await mockService.addPlayersForTeamSeason(10, 9)

            expect(mockGetAPIPlayersFromTeamSeason).toHaveBeenCalledWith(10, 9)
            expect(mockGetAPIPlayerInfoFromId).toHaveBeenCalledTimes(2)
            expect(mockGetAPIPlayerInfoFromId).toHaveBeenNthCalledWith(1, 1)
            expect(mockGetAPIPlayerInfoFromId).toHaveBeenNthCalledWith(2, 2)
            expect(mockPlayersRepo.insertPlayer).toHaveBeenCalledTimes(2)
            expect(mockPlayersRepo.insertPlayer).toHaveBeenNthCalledWith(1, mockPlayers[0])
            expect(mockPlayersRepo.insertPlayer).toHaveBeenNthCalledWith(2, mockPlayers[1])

            expect(count).toBe(1)
        })
    })
    describe('addAllPlayersForSeason', () => {
        it('should add players for all teams in a season and return total count of added players', async () => {
            jest.spyOn(mockTeamSeasonsRepo, 'getAllTeamsFromSeason').mockResolvedValueOnce([10])
            mockGetAPIPlayersFromTeamSeason.mockResolvedValueOnce(mockAPIPlayers)
            mockGetAPIPlayerInfoFromId.mockResolvedValueOnce(mockAPIPlayerProfiles[0]).mockResolvedValueOnce(mockAPIPlayerProfiles[1])
            jest.spyOn(mockPlayersRepo, 'insertPlayer').mockResolvedValueOnce(mockPlayers[0]).mockResolvedValueOnce(mockPlayers[1])

            const count = await mockService.addAllPlayersForSeason(9)
            expect(count).toBe(2)
            expect(mockTeamSeasonsRepo.getAllTeamsFromSeason).toHaveBeenCalledWith(9)
            expect(mockGetAPIPlayersFromTeamSeason).toHaveBeenCalledWith(10, 9)
            expect(mockGetAPIPlayerInfoFromId).toHaveBeenCalledTimes(2)
            expect(mockGetAPIPlayerInfoFromId).toHaveBeenNthCalledWith(1, 1)
            expect(mockGetAPIPlayerInfoFromId).toHaveBeenNthCalledWith(2, 2)
            expect(mockPlayersRepo.insertPlayer).toHaveBeenCalledTimes(2)
            expect(mockPlayersRepo.insertPlayer).toHaveBeenNthCalledWith(1, mockPlayers[0])
            expect(mockPlayersRepo.insertPlayer).toHaveBeenNthCalledWith(2, mockPlayers[1])
        })
    })
})