import axios from "axios";
import { Season } from "../PremierLeague/types/seasons.js";
import { FixtureAPIResposne } from "../PremierLeague/types/API-Football/fixture.js";
import { getAPIFixturesFromSeasonGameweek, getFixturesFromSeason } from "./fixturesClient.js";
import { seasonsRepo } from "../PremierLeague/repos/seasonsRepo.js";



jest.mock('axios')
jest.mock('../PremierLeague/repos/seasonsRepo', () => ({
    seasonsRepo: {
        getSeasonById: jest.fn()
    }
}))

seasonsRepo
const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedGetSeasonById = seasonsRepo.getSeasonById as jest.MockedFunction<typeof seasonsRepo.getSeasonById>

const mockSeason: Season = {
    id: 3,
    name: '2025/26',
    start_date: new Date(),
    end_date: new Date(),
    league_id: 39
}

const mockFixtureResponse: FixtureAPIResposne = {
    get: 'fixtures',
    parameters: {
        league: '39',
        season: '2025'
    },
    results: 1,
    paging: { 
        current: 1,
        total: 1
    },
    errors: [],
    response: [
        {
            fixture: {
                id: 12,
                referee: 'Anthony Taylor',
                timezone: 'UTC',
                date: '2025-08-15',
                timestamp: 12345,
                periods: {
                    first: 11111111,
                    second: 12222222
                }, 
                venue: {
                    id: 550,
                    name: 'Anfield',
                    city: 'Liverpool'
                },
                status: {
                    long: 'Match Finished',
                    short: 'FT',
                    elapsed: 90,
                    extra: 7
                },
            }, 
            league: {
                id: 39,
                name: 'Premier League',
                country: 'England',
                logo: 'https://logo',
                flag: 'https://flag',
                season: 2025,
                round: 'Regular Season - 1',
                standings: true
            }, 
            teams: {
                home: {
                    id: 40,
                    name: 'Liverpool',
                    logo: 'https://liverpoool',
                    winner: true
                }, 
                away: {
                    id: 35,
                    name: 'Bournemouth',
                    logo: 'https://bournemouth',
                    winner: false
                }
            },
            goals: {
                home: 4,
                away: 2
            },
            score: {
                halftime: {
                    home: 1,
                    away: 0
                }, 
                fulltime: {
                    home: 4,
                    away: 2
                },
                extratime: {
                    home: null,
                    away: null,
                },
                penalty: {
                    home: null,
                    away: null
                }
            }
        }
    ]
}

describe('Testing fixturesClient.ts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.API_KEY = 'test-api-key'
    })
    afterEach(() => {
        delete process.env.API_KEY;
    });
    describe('Testing getFixturesFromSeason', () => {
        it('when season exists, axios.get is called with correct parameters and returns correct data', async () => {
            mockedGetSeasonById.mockResolvedValue(mockSeason)
            mockedAxios.get.mockResolvedValue({ data: mockFixtureResponse })
            const result = await getFixturesFromSeason(3)
            
            expect(mockedAxios.get).toHaveBeenCalledWith('https://v3.football.api-sports.io/fixtures', {
                headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': 'test-api-key'
                },
                params: {
                    league: 39,
                    season: 2025
                }
            })
            expect(result).toEqual(mockFixtureResponse)
        })
        it('when season is undefined, an Error is thrown', async () => {
            mockedGetSeasonById.mockResolvedValue(undefined)

            await expect(getFixturesFromSeason(3)).rejects.toThrow('Failed to get season with id=3')
        })
        it('when response.data contains errors, an error is thrown containing a message with all errors', async () => {
            mockedGetSeasonById.mockResolvedValue(mockSeason)
            mockedAxios.get.mockResolvedValue({
                data: {
                    ...mockFixtureResponse,
                    errors: {
                        league: 'The league field must contain an integer',
                        season: 'The season field must contain an integer',
                    }
                }
            })

            await expect(getFixturesFromSeason(3)).rejects.toThrow('The league field must contain an integer; The season field must contain an integer')
        })
    })
    describe('Testing getAPIFixturesFromSeasonGameweek', () => {
        it('when season exists, axios.get is called with correct parameters and returns correct data', async () => {
            mockedGetSeasonById.mockResolvedValue(mockSeason)
            mockedAxios.get.mockResolvedValue({
                data: {
                    ...mockFixtureResponse,
                    parameters: {
                        ...mockFixtureResponse.parameters,
                        round: 'Regular Season - 1'
                    }
                }
            })

            const result = await getAPIFixturesFromSeasonGameweek(3, 1)
            expect(mockedAxios.get).toHaveBeenCalledWith('https://v3.football.api-sports.io/fixtures', {
                headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': 'test-api-key'
                },
                params: {
                    league: 39,
                    season: 2025,
                    round: 'Regular Season - 1'
                }
            })
            expect(result).toEqual({
                ...mockFixtureResponse,
                parameters: {
                    ...mockFixtureResponse.parameters,
                    round: 'Regular Season - 1'
                }
            })
        })
        it('when season is undefined, an Error is thrown', async () => {
            mockedGetSeasonById.mockResolvedValue(undefined)

            await expect(getAPIFixturesFromSeasonGameweek(3, 1)).rejects.toThrow('Failed to get season with id=3')
        })
        it('when response.data contains errors, an error is thrown containing a message with all errors', async () => {
            mockedGetSeasonById.mockResolvedValue(mockSeason)
            mockedAxios.get.mockResolvedValue({
                data: {
                    ...mockFixtureResponse,
                    errors: {
                        league: 'The league field must contain an integer',
                        season: 'The season field must contain an integer',
                    }
                }
            })

            await expect(getAPIFixturesFromSeasonGameweek(3, 1)).rejects.toThrow('The league field must contain an integer; The season field must contain an integer')
        })
    })
})