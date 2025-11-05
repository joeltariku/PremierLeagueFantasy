import axios from "axios";
import { TeamsAPIResponse } from "../PremierLeague/types/API-Football/teams";
import { getTeamsFromSeason } from "./teamsClient";
import { parseAsync } from "@babel/core";

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const mockTeamsResponse: TeamsAPIResponse = {
    get: 'fixture',
    parameters: {
        leauge: '39',
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
            team: {
                id: 33,
                name: 'Manchester United',
                code: 'MUN',
                country: 'England',
                founded: 1882,
                national: false,
                logo: "https://manchesterunited.com"
            },
            venue: {
                id: 1,
                name: "Old Trafford",
                address: "Manchester Lane",
                city: "Manchester",
                capacity: 75000,
                surface: 'grass',
                image: "https://oldtrafford.com"
            }
        },
        {
            team: {
                id: 42,
                name: 'Arsenal',
                code: 'ARS',
                country: 'England',
                founded: 1886,
                national: false,
                logo: 'http://arsenal.com'
            },
            venue: {
                id: 2,
                name: 'Emirates Stadium',
                address: 'Islington',
                city: 'London',
                capacity: 60000,
                surface: 'grass',
                image: 'https://emiratesstadium.com'
            }
        }
    ]
}

describe('Testing teamsClient.ts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.API_KEY = 'test-api-key'
    })
    afterEach(() => {
        delete process.env.API_KEY
    })
    describe('Testing getTeamsFromSeason', () => {
        it('axios.get is called with right parameters and returns correct data', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockTeamsResponse })
            const result = await getTeamsFromSeason(39, 2025)

            expect(mockedAxios.get).toHaveBeenCalledWith('https://v3.football.api-sports.io/teams', {
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': 'test-api-key'
                },
                params: {
                    league: 39,
                    season: 2025
                }
            })
            expect(result).toEqual(mockTeamsResponse)
        })
        it('when response.data contains errors, an error is thrown containing a message with all errors', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {
                    ...mockTeamsResponse,
                    errors: {
                        league: 'The league field must contain an integer',
                        season: 'The season field must contain an integer'
                    }
                }
            })

            await expect(getTeamsFromSeason(39, 2025)).rejects.toThrow('The league field must contain an integer; The season field must contain an integer')
        }) 
    })
})