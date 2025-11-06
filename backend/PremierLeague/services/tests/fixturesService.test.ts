import { jest } from '@jest/globals'
import { Fixture } from '../../types/fixture'
import { Season } from '../../types/seasons'
import { FixtureAPIResposne } from '../../types/API-Football/fixture'
import { conn } from '../../../utils/db'
import { QueryResult } from 'pg'
import * as FixturesService from '../fixturesService'

jest.mock('pg', () => ({
    Pool: jest.fn().mockImplementation(() => ({
        query: jest.fn()
    }))
}))

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

const mockSeason: Season = {
    id: 9,
    name: '2025/26',
    start_date: new Date(),
    end_date: new Date(),
    league_id: 39
}

const mockFixtureAPIResponse: FixtureAPIResposne = {
    get: 'fixtures',
    parameters: {
        season: '2025',
        league: '39'
    },
    errors: [],
    results: 2,
    paging: {
        current: 1,
        total: 1
    },
    response: [
        {
            fixture: {
                id: mockFixtures[0].id,
                referee: 'Anthony Taylor',
                timezone: 'UTC',
                date: mockFixtures[0].date.toISOString(),
                timestamp: null,
                periods: {
                    first: null,
                    second: null
                },
                venue: {
                    id: 98,
                    name: 'Emirates Stadium',
                    city: 'London'
                },
                status: {
                    long: 'Not Started',
                    short: 'NS',
                    elapsed: null,
                    extra: null
                }
            },
            league: {
                id: 39,
                name: 'Premier League',
                country: 'England',
                logo: 'https://premierleague.com',
                flag: 'http://england.com',
                season: mockSeason.id,
                round: 'Regular Season - 14',
                standings: true
            },
            teams: {
                home: {
                    id: mockFixtures[0].home_team_id,
                    name: 'Arsenal',
                    logo: 'https://arsenal.com',
                    winner: null
                },
                away: {
                    id: mockFixtures[0].away_team_id,
                    name: 'Chelsea',
                    logo: 'https://chelsea.com',
                    winner: null
                }
            },
            goals: {
                home: null,
                away: null
            },
            score: {
                halftime: {
                    home: null,
                    away: null
                }, 
                fulltime: {
                    home: null,
                    away: null
                },
                extratime: {
                    home: null,
                    away: null
                },
                penalty: {
                    home: null,
                    away: null
                }
            }
        }, 
        {
            fixture: {
                id: mockFixtures[1].id,
                referee: 'Mike Dean',
                timezone: 'UTC',
                date: mockFixtures[1].date.toISOString(),
                timestamp: 123456789,
                periods: {
                    first: 123456789,
                    second: 111111111
                },
                venue: {
                    id: 98,
                    name: 'Old Trafford',
                    city: 'Manchester'
                },
                status: {
                    long: 'Match Finished',
                    short: 'FT',
                    elapsed: 93,
                    extra: null
                }
            },
            league: {
                id: 39,
                name: 'Premier League',
                country: 'England',
                logo: 'https://premierleague.com',
                flag: 'http://england.com',
                season: mockSeason.id,
                round: 'Regular Season - 14',
                standings: true
            },
            teams: {
                home: {
                    id: mockFixtures[1].home_team_id,
                    name: 'Manchester United',
                    logo: 'https://manchesterunited.com',
                    winner: true
                },
                away: {
                    id: mockFixtures[1].away_team_id,
                    name: 'Liverpool',
                    logo: 'https://liverpool.com',
                    winner: false
                }
            },
            goals: {
                home: 1,
                away: 1
            },
            score: {
                halftime: {
                    home: 0,
                    away: 0
                }, 
                fulltime: {
                    home: 1,
                    away: 1
                },
                extratime: {
                    home: null,
                    away: null
                },
                penalty: {
                    home: null,
                    away: null
                }
            }
        }
    ]
}

describe('Fixtures Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(conn, 'query').mockResolvedValue({
            rows: mockFixtures,
            rowCount: mockFixtures.length
        } as QueryResult<Fixture>)
    })
    it('getAllFixturesFromSeason makes correct query and returns all rows', async () => {
        const result = await FixturesService.getAllFixtursFromSeason(9)
        expect(conn.query).toHaveBeenCalledWith('SELECT * FROM fixtures WHERE season_id = $1', [9])
        expect(result).toEqual(mockFixtures)
    })
    it('getFixturesFromSeasonGameweek makes correct query and returns all rows', async () => {
        const result = await FixturesService.getFixutresFromSeasonGameweek(9, 14)
        expect(conn.query).toHaveBeenCalledWith('SELECT * FROM fixtures WHERE season_id = $1 AND gameweek = $2', [9, 14])
        expect(result).toEqual(mockFixtures)
    })
    it('getFixtureById makes correct query and returns first row', async () => {
        const result = await FixturesService.getFixtureById(1)
        expect(conn.query).toHaveBeenCalledWith('SELECT * FROM fixtures WHERE id = $1', [1])
        expect(result).toEqual(mockFixtures[0])
    })
    it('insertFixtures makes correct query and returns first row', async () => {
        const mockFixture = mockFixtures[0]
        const { id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals } = mockFixture
        const result = await FixturesService.insertFixture(mockFixture)
        expect(conn.query).toHaveBeenCalledWith(
            `INSERT INTO fixtures (id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [id, season_id, gameweek, date, home_team_id, away_team_id, status, home_goals, away_goals]
        )
        expect(result).toEqual(mockFixture)
    })
    it('insertFixtures properly handles when getFixtureById returns an existing team and undefined team', async () => {
        const mockGetFixtureById = jest.fn<(fixtureId: number) => Promise<Fixture | undefined>>()
        mockGetFixtureById
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(mockFixtures[1])

        const mockInsertFixture = jest.fn<(fixture: Fixture) => Promise<Fixture>>()
        mockInsertFixture.mockResolvedValue(mockFixtures[1])

        const result = await FixturesService.insertFixtures(mockFixtures, {
            getFixtureById: mockGetFixtureById,
            insertFixture: mockInsertFixture
        })

        expect(mockGetFixtureById).toHaveBeenCalledTimes(2)
        expect(mockInsertFixture).toHaveBeenCalledTimes(1)

        expect(mockGetFixtureById).toHaveBeenCalledWith(1)
        expect(mockInsertFixture).toHaveBeenCalledWith(mockFixtures[0])

        expect(mockGetFixtureById).toHaveBeenCalledWith(2)
        
        expect(result).toEqual(1)
    })
    it('insertFixtures properly handles when fixtures array is empty', async () => {
        const mockGetFixtureById = jest.fn<(fixtureId: number) => Promise<Fixture | undefined>>()
        mockGetFixtureById
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(mockFixtures[1])

        const mockInsertFixture = jest.fn<(fixture: Fixture) => Promise<Fixture>>()
        mockInsertFixture.mockResolvedValue(mockFixtures[1])

        const result = await FixturesService.insertFixtures([], {
            getFixtureById: mockGetFixtureById,
            insertFixture: mockInsertFixture
        })

        expect(result).toEqual(0)
        expect(mockGetFixtureById).toHaveBeenCalledTimes(0)
        expect(mockInsertFixture).toHaveBeenCalledTimes(0)
    })
    it('addFixturesForSeason returns size of api response when all fixtures are inserted', async () => {
        const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>()
        mockGetSeasonById.mockResolvedValue(mockSeason)

        const mockGetFixturesFromSeason = jest.fn<(seasonId: number) => Promise<FixtureAPIResposne>>()
        mockGetFixturesFromSeason.mockResolvedValue(mockFixtureAPIResponse)

        const mockInsertFixtures = jest.fn<(fixtures: Fixture[]) => Promise<number>>()

        await FixturesService.addFixturesForSeason(9, {
            getSeasonById: mockGetSeasonById,
            getFixturesFromSeason: mockGetFixturesFromSeason,
            insertFixtures: mockInsertFixtures
        })

        expect(mockGetSeasonById).toHaveBeenCalledWith(9)
        expect(mockGetFixturesFromSeason).toHaveBeenCalledWith(9)
        expect(mockInsertFixtures).toHaveBeenCalledWith([
            {
                id: mockFixtures[0].id,
                season_id: mockFixtures[0].season_id,
                gameweek: mockFixtures[0].gameweek,
                date: mockFixtures[0].date,
                home_team_id: mockFixtures[0].home_team_id,
                away_team_id: mockFixtures[0].away_team_id,
                status: mockFixtures[0].status,
                home_goals: mockFixtures[0].home_goals,
                away_goals: mockFixtures[0].away_goals
            }, 
            {
                id: mockFixtures[1].id,
                season_id: mockFixtures[1].season_id,
                gameweek: mockFixtures[1].gameweek,
                date: mockFixtures[1].date,
                home_team_id: mockFixtures[1].home_team_id,
                away_team_id: mockFixtures[1].away_team_id,
                status: mockFixtures[1].status,
                home_goals: mockFixtures[1].home_goals,
                away_goals: mockFixtures[1].away_goals
            }
        ])
    })
    it('addFixturesForSeason throws an error when getSeasonById returns undefined', async () => {
        const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>()
        mockGetSeasonById.mockResolvedValue(undefined)

        const mockGetFixturesFromSeason = jest.fn<(seasonId: number) => Promise<FixtureAPIResposne>>()
        mockGetFixturesFromSeason.mockResolvedValue(mockFixtureAPIResponse)

        const mockInsertFixtures = jest.fn<(fixtures: Fixture[]) => Promise<number>>()

        await expect(FixturesService.addFixturesForSeason(9, {
            getSeasonById: mockGetSeasonById,
            getFixturesFromSeason: mockGetFixturesFromSeason,
            insertFixtures: mockInsertFixtures
        })).rejects.toThrow('Failed to get season with id = 9')

        expect(mockGetFixturesFromSeason).not.toHaveBeenCalled()
        expect(mockInsertFixtures).not.toHaveBeenCalled()
    })
    it('update fixtures makes correct query and returns count of updated fixtures', async () => {
        const result = await FixturesService.updateFixtures(mockFixtures)

        const sqlPattern =
            /UPDATE\s+fixtures\s+SET\s+date\s*=\s*\$1,\s*status\s*=\s*\$2,\s*home_goals\s*=\s*\$3,\s*away_goals\s*=\s*\$4\s+WHERE\s+id\s*=\s*\$5\s+AND\s*status\s*!=\s*'Match Finished'\s+RETURNING\s*\*/;

        expect(conn.query).toHaveBeenNthCalledWith(1, expect.stringMatching(sqlPattern), [
            mockFixtures[0].date,
            mockFixtures[0].status,
            mockFixtures[0].home_goals,
            mockFixtures[0].away_goals,
            mockFixtures[0].id
        ])
        expect(conn.query).toHaveBeenNthCalledWith(2, expect.stringMatching(sqlPattern), [
            mockFixtures[1].date,
            mockFixtures[1].status,
            mockFixtures[1].home_goals,
            mockFixtures[1].away_goals,
            mockFixtures[1].id
        ])
        expect(result).toEqual(2)
    })
    it('update fixtures does not count fixtures that are not updated', async () => {
        jest.spyOn(conn, 'query').mockResolvedValue({
            rows: [],
            rowCount: 0
        })
        const result = await FixturesService.updateFixtures(mockFixtures)

        expect(result).toEqual(0)
    })
    describe('updateFixturesFromSeasonGW', () => {
        it('updateFixutresFromSeasonGW makes correct function calls', async () => {
            const mockGetFixturesFromSeasonGameweek = jest.fn<(seasonId: number, gameweek: number) => Promise<FixtureAPIResposne>>()
            mockGetFixturesFromSeasonGameweek.mockResolvedValue(mockFixtureAPIResponse)

            const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>()
            mockGetSeasonById.mockResolvedValue(mockSeason)

            const mockUpdateFixtures = jest.fn<(fixtures: Fixture[]) => Promise<number>>()
            
            await FixturesService.updateFixturesFromSeasonGW(9, 14, {
                getAPIFixturesFromSeasonGameweek: mockGetFixturesFromSeasonGameweek,
                getSeasonById: mockGetSeasonById,
                updateFixtures: mockUpdateFixtures
            })
            
            expect(mockGetSeasonById).toHaveBeenCalledWith(9)
            expect(mockGetFixturesFromSeasonGameweek).toHaveBeenCalledWith(9, 14)
            expect(mockUpdateFixtures).toHaveBeenCalledWith([
                {
                    id: mockFixtures[0].id,
                    season_id: mockFixtures[0].season_id,
                    gameweek: mockFixtures[0].gameweek,
                    date: mockFixtures[0].date,
                    home_team_id: mockFixtures[0].home_team_id,
                    away_team_id: mockFixtures[0].away_team_id,
                    status: mockFixtures[0].status,
                    home_goals: mockFixtures[0].home_goals,
                    away_goals: mockFixtures[0].away_goals
                }, 
                {
                    id: mockFixtures[1].id,
                    season_id: mockFixtures[1].season_id,
                    gameweek: mockFixtures[1].gameweek, 
                    date: mockFixtures[1].date,
                    home_team_id: mockFixtures[1].home_team_id,
                    away_team_id: mockFixtures[1].away_team_id,
                    status: mockFixtures[1].status,
                    home_goals: mockFixtures[1].home_goals,
                    away_goals: mockFixtures[1].away_goals
                }
            ])
        })
        it('updateFixturesFromSeasonGW throws an error when getSeasonById returns undefined', async () => {
            const mockGetFixturesFromSeasonGameweek = jest.fn<(seasonId: number, gameweek: number) => Promise<FixtureAPIResposne>>()
            mockGetFixturesFromSeasonGameweek.mockResolvedValue(mockFixtureAPIResponse)

            const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>()
            mockGetSeasonById.mockResolvedValue(undefined)

            const mockUpdateFixtures = jest.fn<(fixtures: Fixture[]) => Promise<number>>()
            
            await expect(FixturesService.updateFixturesFromSeasonGW(9, 14, {
                getAPIFixturesFromSeasonGameweek: mockGetFixturesFromSeasonGameweek,
                getSeasonById: mockGetSeasonById,
                updateFixtures: mockUpdateFixtures
            })).rejects.toThrow('Cannot find season with id=9')

            expect(mockGetSeasonById).toHaveBeenCalledWith(9)
            expect(mockGetFixturesFromSeasonGameweek).not.toHaveBeenCalled()
            expect(mockUpdateFixtures).not.toHaveBeenCalled()
        })
    })
})