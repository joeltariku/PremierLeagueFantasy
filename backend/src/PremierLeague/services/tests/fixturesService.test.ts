import { jest } from '@jest/globals'
import { Fixture } from '../../types/fixture.js'
import { Season } from '../../types/seasons.js'
import { FixtureAPIResposne } from '../../types/API-Football/fixture.js'
import { QueryResult } from 'pg'
import { fixturesRepo } from '../../repos/fixturesRepo.js'
import { seasonsRepo } from '../../repos/seasonsRepo.js'
import { makeFixturesService } from '../fixturesService.js'

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

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

const mockInsertFixtures = jest.fn<(fixtures: Fixture[]) => Promise<number>>().mockResolvedValue(mockFixtures.length)
const mockUpdateFixtures = jest.fn<(fixtures: Fixture[]) => Promise<number>>().mockResolvedValue(mockFixtures.length)

const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>().mockResolvedValue(mockSeason)

const mockFixturesRepo: Pick<typeof fixturesRepo, 'insertFixtures' | 'updateFixtures'> = {
    insertFixtures: mockInsertFixtures,
    updateFixtures: mockUpdateFixtures,
}
const mockSeasonsRepo: Pick<typeof seasonsRepo, 'getSeasonById'> = {
    getSeasonById: mockGetSeasonById
}

const mockGetAPIFixturesFromSeason = jest.fn<(seasonId: number) => Promise<FixtureAPIResposne>>()
const mockGetAPIFixturesFromSeasonGameweek =  jest.fn<(seasonId: number, gameweek: number) => Promise<FixtureAPIResposne>>().mockResolvedValue(mockFixtureAPIResponse) 

const mockFixturesService = makeFixturesService({
    fixturesRepo: mockFixturesRepo,
    seasonsRepo: mockSeasonsRepo,
    getAPIFixturesFromSeason: mockGetAPIFixturesFromSeason,
    getAPIFixturesFromSeasonGameweek: mockGetAPIFixturesFromSeasonGameweek,
})

describe('Fixtures Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockDB.query.mockResolvedValue({
            rows: mockFixtures,
            rowCount: mockFixtures.length
        } as QueryResult<Fixture>)
        mockGetAPIFixturesFromSeason.mockResolvedValue(mockFixtureAPIResponse)
        mockGetAPIFixturesFromSeasonGameweek.mockResolvedValue(mockFixtureAPIResponse)
        mockGetSeasonById.mockResolvedValue(mockSeason)
        mockInsertFixtures.mockResolvedValue(mockFixtures.length)
        mockUpdateFixtures.mockResolvedValue(mockFixtures.length)
    })
    describe('addFixturesForSeason', () => {
        it('addFixturesForSeason returns number of inserted fixtures', async () => {
            const result = await mockFixturesService.addFixturesForSeason(9)
            expect(mockSeasonsRepo.getSeasonById).toHaveBeenCalledWith(9)
            expect(mockGetAPIFixturesFromSeason).toHaveBeenCalledWith(9)
            expect(mockFixturesRepo.insertFixtures).toHaveBeenCalledWith(mockFixtures)
            expect(result).toEqual(mockFixtures.length)
        })
        it('addFixturesForSeason throws an error when getSeasonById returns undefined', async () => {
            mockGetSeasonById.mockResolvedValueOnce(undefined)

            await expect(mockFixturesService.addFixturesForSeason(9)).rejects.toThrow('Failed to get season with id = 9')
            expect(mockGetAPIFixturesFromSeason).not.toHaveBeenCalled()
            expect(mockFixturesRepo.insertFixtures).not.toHaveBeenCalled()
        })
    })
    describe('updateFixturesFromSeasonGW', () => {
        it('updateFixutresFromSeasonGW returns number of updated fixtures', async () => {
            const result = await mockFixturesService.updateFixturesFromSeasonGW(9, 14)
            expect(mockGetSeasonById).toHaveBeenCalledWith(9)
            expect(mockGetAPIFixturesFromSeasonGameweek).toHaveBeenCalledWith(9, 14)
            expect(mockUpdateFixtures).toHaveBeenCalledWith(mockFixtures)
            expect(result).toEqual(mockFixtures.length)
        })
        it('updateFixturesFromSeasonGW throws an error when getSeasonById returns undefined', async () => {
            mockGetSeasonById.mockResolvedValueOnce(undefined)

            await expect(mockFixturesService.updateFixturesFromSeasonGW(9, 14)).rejects.toThrow('Cannot find season with id=9')
            expect(mockGetAPIFixturesFromSeasonGameweek).not.toHaveBeenCalled()
            expect(mockUpdateFixtures).not.toHaveBeenCalled()
        })
    })
})