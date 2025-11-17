import { jest } from '@jest/globals'
import { QueryResult } from "pg"
import { Team } from "../../types/teams.js"
// import * as TeamsService from '../teamsService'
import { Season } from '../../types/seasons.js'
import { TeamsAPIResponse } from '../../types/API-Football/teams.js'
import { makeTeamsService } from '../teamsService.js'


// jest.mock('pg', () => ({
//     Pool: jest.fn().mockImplementation(() => ({
//         query: jest.fn()
//     }))
// }))

const mockDB = {
    query: jest.fn<(query: string, values?: any[]) => Promise<QueryResult<any>>>()
}

const mockTeams: Team[] = [
    {
        id: 1,
        name: 'Arsenal',
        code: 'ARS',
        country: 'England'
    }, 
    {
        id: 2,
        name: 'Chelsea',
        code: 'CHE',
        country: 'England'
    }
]

const mockSeason: Season = {
    id: 14,
    name: '2025/26',
    start_date: new Date(),
    end_date: new Date(),
    league_id: 39
}

const mockTeamsAPIResponse: TeamsAPIResponse = {
    get: "teams",
    parameters: {
        league: '39',
        season: '2025'
    },
    errors: [],
    results: 1,
    paging: {
        current: 1,
        total: 1
    },
    response: [
        {
            team: {
                id: 1,
                name: 'Arsenal',
                code: 'ARS',
                country: 'England',
                founded: 1800,
                national: false,
                logo: 'logo'
            },
            venue: {
                id: 100,
                name: 'Emirates',
                address: 'Islington',
                city: 'London',
                capacity: 60000,
                surface: 'grass',
                image: 'image'
            }
        }
    ]
}


const mockInsertManyTeams = jest.fn<(teams: Team[]) => Promise<number>>().mockResolvedValue(mockTeamsAPIResponse.response.length)
const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>().mockResolvedValue(mockSeason)

const mockGetAPITeamsFromSeason = jest.fn<(leagueId: number, year: number) => Promise<TeamsAPIResponse>>().mockResolvedValue(mockTeamsAPIResponse)
const mockSeasonsRepo = {
    getSeasonById: mockGetSeasonById
}
const mockTeamsRepo = {
    insertManyTeams: mockInsertManyTeams
}
const mockTeamsService = makeTeamsService({ 
    seasonsRepo: mockSeasonsRepo,
    teamsRepo: mockTeamsRepo,
    getAPITeamsFromSeason: mockGetAPITeamsFromSeason
})


describe('Teams Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('addTeamsForSeason returns size of api response when all teams are inserted', async () => {

        const result = await mockTeamsService.addTeamsForSeason(14)

        expect(mockGetSeasonById).toHaveBeenCalledWith(14)
        expect(mockGetAPITeamsFromSeason).toHaveBeenCalledWith(39, 2025)
        expect(mockInsertManyTeams).toHaveBeenCalledWith([{
            id: 1,
            name: 'Arsenal',
            code: 'ARS',
            country: 'England'
        }])
        expect(result).toEqual(1)
    })
    it('addTeamsForSeason returns 0 when getSeasonById returns undefined', async () => {
        mockGetSeasonById.mockResolvedValueOnce(undefined)
        const result = await mockTeamsService.addTeamsForSeason(14)

        expect(mockGetSeasonById).toHaveBeenCalledWith(14)
        expect(mockGetAPITeamsFromSeason).not.toHaveBeenCalled()
        expect(mockInsertManyTeams).not.toHaveBeenCalled()

        expect(result).toEqual(0)
    })
}) 