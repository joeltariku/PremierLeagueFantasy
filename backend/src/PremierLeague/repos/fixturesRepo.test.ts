import { jest } from "@jest/globals";
import { Pool, QueryResult } from "pg";
import { makeFixturesRepo } from "./fixturesRepo";
import { Fixture } from "../types/fixture";


const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockRepo = makeFixturesRepo(mockDB)
const mockFixtures: Fixture[] = [
    {
        id: 1,
        season_id: 9,
        gameweek: 14,
        date: new Date(),
        home_team_id: 19,
        away_team_id: 20,
        status: 'Not Started',
        home_goals: 0,
        away_goals: 0
    },
    {
        id: 2,
        season_id: 9,
        gameweek: 14,
        date: new Date(),
        home_team_id: 21,
        away_team_id: 22,
        status: 'Match Finished',
        home_goals: 1,
        away_goals: 1
    }
]  
describe('fixturesRepo', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDB.query.mockResolvedValue({
            rows: mockFixtures,
            rowCount: mockFixtures.length
        } as QueryResult<Fixture>)
    })
    describe('getAllFixtursFromSeason', () => {
        it('makes correct query and returns all rows', async () => {
            const result = await mockRepo.getAllFixturesFromSeason(9)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM fixtures WHERE season_id = $1', [9])
            expect(result).toEqual(mockFixtures)
        })
    })
    describe('getFixutresFromSeasonGameweek', () => {
        it('makes correct query and returns all rows', async () => {
            const result = await mockRepo.getFixturesFromSeasonGameweek(9, 14)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM fixtures WHERE season_id = $1 AND gameweek = $2', [9, 14])
            expect(result).toEqual(mockFixtures)
        })
    })
    describe('getFixtureById', () => {
        it('makes correct query and returns first row', async () => {
            const result = await mockRepo.getFixtureById(1)
            expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM fixtures WHERE id = $1', [1])
            expect(result).toEqual(mockFixtures[0])
        })
    })
    describe('insertFixture', () => {
          it('makes correct query and returns first row', async () => {
            const mockFixture = mockFixtures[0]
            const { id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals } = mockFixture
            const result = await mockRepo.insertFixture(mockFixture)
            expect(mockDB.query).toHaveBeenCalledWith(
                'INSERT INTO fixtures (id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
                [id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals]
            )
            expect(result).toEqual(mockFixture)
          })
    })
    describe('insertFixtures', () => {
        it('inserts fixtures and returns count', async () => {
            mockDB.query
                .mockResolvedValueOnce({
                    rows: [] as Fixture[],
                } as QueryResult<Fixture>)
                .mockResolvedValueOnce({
                    rows: [mockFixtures[0]],
                } as QueryResult<Fixture>)
                .mockResolvedValueOnce({
                    rows: [] as Fixture[],
                } as QueryResult<Fixture>)
                .mockResolvedValueOnce({
                    rows: [mockFixtures[1]],
                } as QueryResult<Fixture>)
            
            const result = await mockRepo.insertFixtures(mockFixtures)
            expect(mockDB.query).toHaveBeenCalledTimes(4)
            expect(result).toBe(2)
        })
        it('properly handles when fixtures array is empty', async () => {
            const result = await mockRepo.insertFixtures([])
            expect(result).toBe(0)
            expect(mockDB.query).toHaveBeenCalledTimes(0)
        })
    })
    describe('updateFixture', () => {
        it('makes correct query and returns updated fixture', async () => {
            const result = await mockRepo.updateFixture(mockFixtures[0])
        
            const sqlPattern = /UPDATE\s+fixtures\s+SET\s+date\s*=\s*\$1,\s*status\s*=\s*\$2,\s*home_goals\s*=\s*\$3,\s*away_goals\s*=\s*\$4\s+WHERE\s+id\s*=\s*\$5\s+AND\s*status\s*!=\s*'Match Finished'\s+RETURNING\s*\*/;
        
            expect(mockDB.query).toHaveBeenCalledWith(
                expect.stringMatching(sqlPattern),
                [mockFixtures[0].date, mockFixtures[0].status, mockFixtures[0].home_goals, mockFixtures[0].away_goals, mockFixtures[0].id]
            )
            expect(result).toEqual(mockFixtures[0])
        })
    })
    describe('updateFixtures', () => {
        it('updates fixtures and returns count', async () => {
            mockDB.query
                .mockResolvedValueOnce({
                    rows: [mockFixtures[0]],
                } as QueryResult<Fixture>)
                .mockResolvedValueOnce({
                    rows: [mockFixtures[1]],
                } as QueryResult<Fixture>)

            const result = await mockRepo.updateFixtures(mockFixtures)
            expect(result).toBe(2)
        })
        it('update fixtures doesnt include fixtures that arent updated in count', async () => {
            mockDB.query.mockResolvedValueOnce({
                rows: [] as Fixture[],
            } as QueryResult<Fixture>)

            const result = await mockRepo.updateFixtures(mockFixtures)
            expect(result).toBe(1)
       
        })
    })
})