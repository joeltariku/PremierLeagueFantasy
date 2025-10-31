import { jest } from '@jest/globals'
import { QueryResult } from "pg"
import { conn } from "../../../utils/db"
import { Team } from "../../types/teams"
import * as TeamsService from '../teamsService'
import { Season } from '../../types/seasons'
import { TeamsAPIResponse } from '../../types/API-Football/teams'


jest.mock('pg', () => ({
    Pool: jest.fn().mockImplementation(() => ({
        query: jest.fn()
    }))
}))

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
    paramaters: {
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

describe('Teams Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(conn, 'query').mockResolvedValue({
            rows: mockTeams,
            rowCount: mockTeams.length
        } as QueryResult<Team>)
    })
    it('getAllTeams is called with the right query and returns all rows', async () => {
        const result = await TeamsService.getAllTeams()
        expect(conn.query).toHaveBeenCalledWith('SELECT * FROM teams')
        expect(result).toEqual(mockTeams)
    })
    it('getTeamById is called with right query and returns first row', async () => {
        const result = await TeamsService.getTeamById(1)
        expect(conn.query).toHaveBeenCalledWith('SELECT * FROM teams WHERE id = $1', [1])
        expect(result).toEqual(mockTeams[0])
    })
    it('insertTeam is called with right query and returns first rows', async () => {
        const result = await TeamsService.insertTeam(mockTeams[0])
        expect(conn.query).toHaveBeenCalledWith(
            'INSERT INTO public.teams (id, name, code, country) VALUES ($1,$2,$3,$4) RETURNING *',
            [1, 'Arsenal', 'ARS', 'England']
        )
        expect(result).toEqual(mockTeams[0])
    })
    it('insertManyTeams properly handles when getTeamById returns an existing team and undefined team', async () => {
        const mockGetTeamById = jest.fn<(id: number) => Promise<Team | undefined>>()

        mockGetTeamById
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(mockTeams[1])

        const mockInsertTeam = jest.fn<(team: Team) => Promise<Team>>().mockResolvedValue(mockTeams[1]);

        const result = await TeamsService.insertManyTeams(mockTeams, { 
            getTeamById: mockGetTeamById, 
            insertTeam: mockInsertTeam 
        })
        expect(mockGetTeamById).toHaveBeenCalledTimes(2)
        expect(mockInsertTeam).toHaveBeenCalledTimes(1)

        expect(mockGetTeamById).toHaveBeenCalledWith(1)
        expect(mockInsertTeam).toHaveBeenCalledWith(mockTeams[0])

        expect(mockGetTeamById).toHaveBeenCalledWith(2)

        expect(result).toEqual(1)
    })
    it('insertManyTeams properly handles when teams array is empty', async () => {
        const mockGetTeamById = jest.fn<(id: number) => Promise<Team | undefined>>()

        mockGetTeamById
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(mockTeams[1])

        const mockInsertTeam = jest.fn<(team: Team) => Promise<Team>>().mockResolvedValue(mockTeams[1]);

        const result = await TeamsService.insertManyTeams([])
        expect(result).toEqual(0)
        expect(mockGetTeamById).toHaveBeenCalledTimes(0)
        expect(mockInsertTeam).toHaveBeenCalledTimes(0)
    })
    it('addTeamsForSeason returns size of api response when all teams are inserted', async () => {
        const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>()
            .mockResolvedValue(mockSeason)

        const mockGetTeamsFromSeason = jest.fn<(leagueId: number, year: number) => Promise<TeamsAPIResponse>>()
            .mockResolvedValue(mockTeamsAPIResponse)
        
        const mockInsertManyTeams = jest.fn<(teams: Team[]) => Promise<number>>()

        const result = await TeamsService.addTeamsForSeason(14, {
            getSeasonById: mockGetSeasonById,
            getTeamsFromSeason: mockGetTeamsFromSeason,
            insertManyTeams: mockInsertManyTeams
        })

        expect(mockGetSeasonById).toHaveBeenCalledWith(14)
        expect(mockGetTeamsFromSeason).toHaveBeenCalledWith(39, 2025)
        expect(mockInsertManyTeams).toHaveBeenCalledWith([{
            id: 1,
            name: 'Arsenal',
            code: 'ARS',
            country: 'England'
        }])
    })
    it('addTeamsForSeason returns 0 when getSeasonById returns undefined', async () => {
        const mockGetSeasonById = jest.fn<(seasonId: number) => Promise<Season | undefined>>()
            .mockResolvedValue(undefined)

        const mockGetTeamsFromSeason = jest.fn<(leagueId: number, year: number) => Promise<TeamsAPIResponse>>()
            .mockResolvedValue(mockTeamsAPIResponse)
        
        const mockInsertManyTeams = jest.fn<(teams: Team[]) => Promise<number>>()

        const result = await TeamsService.addTeamsForSeason(14, {
            getSeasonById: mockGetSeasonById,
            getTeamsFromSeason: mockGetTeamsFromSeason,
            insertManyTeams: mockInsertManyTeams
        })

        expect(mockGetSeasonById).toHaveBeenCalledWith(14)
        expect(mockGetTeamsFromSeason).not.toHaveBeenCalled()
        expect(mockInsertManyTeams).not.toHaveBeenCalled()

        expect(result).toEqual(0)
    })
}) 