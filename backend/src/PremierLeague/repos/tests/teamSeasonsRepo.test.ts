import { jest } from '@jest/globals'
import { QueryResult } from 'pg'
import { makeTeamSeasonsRepo } from '../teamSeasonsRepo.js'
import { TeamSeason } from '../../types/teamSeason.js'

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockRepo = makeTeamSeasonsRepo(mockDB)
const mockTeamSeasons: TeamSeason[] = [
    {
        season_id: 9,
        team_id: 19,
        points: 49,
        rank: 13,
        goals_scored: 45,
        goals_conceded: 50
    }, 
    {
        season_id: 9,
        team_id: 20,
        points: 50,
        rank: 12,
        goals_scored: 50,
        goals_conceded: 45
    }
]

describe('teamSeasonsRepo', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDB.query.mockResolvedValue({
            rows: mockTeamSeasons,
            rowCount: mockTeamSeasons.length
        } as QueryResult<TeamSeason>)
    })
    describe('getTeamSeasonBySeasonIdAndTeamId', () => {
        it('makes correct query and returns first row', async () => {
            const result = await mockRepo.getTeamSeasonBySeasonIdAndTeamId(9, 19)
            expect(mockDB.query).toHaveBeenCalledWith(
                'SELECT * FROM team_seasons WHERE season_id = $1 AND team_id = $2',
                [9, 19]
            )
            expect(result).toEqual(mockTeamSeasons[0])
        })
        it('returns undefined if no rows are found', async () => {
            mockDB.query.mockResolvedValue({
                rows: [] as TeamSeason[],
                rowCount: 0
            } as QueryResult<TeamSeason>)
            const result = await mockRepo.getTeamSeasonBySeasonIdAndTeamId(9, 19)
            expect(result).toBeUndefined()
        })
    })
    describe('insertTeamSeason', () => {
        it('makes correct query and returns first row', async () => {
            const result = await mockRepo.insertTeamSeason(mockTeamSeasons[0])
            expect(mockDB.query).toHaveBeenCalledWith(
                'INSERT INTO team_seasons (season_id, team_id, points, rank, goals_scored, goals_conceded) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
                [mockTeamSeasons[0].season_id, mockTeamSeasons[0].team_id, mockTeamSeasons[0].points, mockTeamSeasons[0].rank, mockTeamSeasons[0].goals_scored, mockTeamSeasons[0].goals_conceded]
            )
            expect(result).toEqual(mockTeamSeasons[0])
        })
    })
    describe('insertTeamSeasons', () => {
        it('only inserts team seasons that do not exist and returns count of inserted team seasons', async () => {
            mockDB.query
                .mockResolvedValueOnce({
                    rows: [] as TeamSeason[],
                    rowCount: 0
                } as QueryResult<TeamSeason>)
            const result = await mockRepo.insertTeamSeasons(mockTeamSeasons)
            expect(mockDB.query).toHaveBeenCalledTimes(3)
            expect(mockDB.query).toHaveBeenCalledWith(
                'SELECT * FROM team_seasons WHERE season_id = $1 AND team_id = $2',
                [9, 19]
            )
            expect(mockDB.query).toHaveBeenCalledWith(
                'INSERT INTO team_seasons (season_id, team_id, points, rank, goals_scored, goals_conceded) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
                [mockTeamSeasons[0].season_id, mockTeamSeasons[0].team_id, mockTeamSeasons[0].points, mockTeamSeasons[0].rank, mockTeamSeasons[0].goals_scored, mockTeamSeasons[0].goals_conceded]
            )
            expect(mockDB.query).toHaveBeenCalledWith(
                'SELECT * FROM team_seasons WHERE season_id = $1 AND team_id = $2',
                [9, 20]
            )
            expect(mockDB.query).not.toHaveBeenCalledWith(
                'INSERT INTO team_seasons (season_id, team_id, points, rank, goals_scored, goals_conceded) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
                [mockTeamSeasons[1].season_id, mockTeamSeasons[1].team_id, mockTeamSeasons[1].points, mockTeamSeasons[1].rank, mockTeamSeasons[1].goals_scored, mockTeamSeasons[1].goals_conceded]
            )
            expect(result).toEqual(1)
        })
        it('returns 0 if teamSeasons array is empty', async () => {
            const result = await mockRepo.insertTeamSeasons([])
            expect(result).toEqual(0)
        })
    })
})