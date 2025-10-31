import { getTeamsFromSeason } from "../../api-clients/teamsClient"
import { conn } from "../../utils/db"
import { APITeam, TeamsAPIResponse } from "../types/API-Football/teams"
import { Season } from "../types/seasons"
import { Team } from "../types/teams"
import { getSeasonById } from "./seasonsService"

export const getAllTeams = async () => {
    const fetch_query = 'SELECT * FROM teams'
    const result = await conn.query(fetch_query)
    return result.rows
}

export const getTeamById = async (teamId: number) => {
    const fetch_query = 'SELECT * FROM teams WHERE id = $1'
    const result = await conn.query(fetch_query, [teamId])
    return result.rows[0]
}

export const insertTeam = async (team: Team) => {
    const { id, name, code, country } = team
    const insert_query= 'INSERT INTO public.teams (id, name, code, country) VALUES ($1,$2,$3,$4) RETURNING *'
    const result= await conn.query(insert_query, [id, name, code, country])
    return result.rows[0]
}

export const insertManyTeams = async (
    teams: Team[],
    deps: {
        getTeamById: (teamId: number) => Promise<Team | undefined>,
        insertTeam: (team: Team) => Promise<Team>
    } = { getTeamById, insertTeam }
): Promise<number> => {
    if (teams.length === 0) return 0
    let count = 0;

    for (const team of teams) {
        const existingTeam = await deps.getTeamById(team.id)
        if (!existingTeam) {
            await deps.insertTeam(team)
            count++;
        }
    }
    return count;
}

export const addTeamsForSeason = async (
    seasonId: number,
    deps: {
        getSeasonById: (seasonId: number) => Promise<Season | undefined>,
        getTeamsFromSeason: (leagueId: number, year: number) => Promise<TeamsAPIResponse>,
        insertManyTeams: (teams: Team[]) => Promise<number>
    } = { getSeasonById, getTeamsFromSeason, insertManyTeams }
): Promise<number> => {
    const season: Season | undefined = await deps.getSeasonById(seasonId)
    if (!season) {
        return 0
    }
    const { league_id, start_date } = season
    const year = start_date.getFullYear()

    const apiTeams = await deps.getTeamsFromSeason(league_id, year)
    const teams: Team[] = apiTeams.response.map((teamObject: APITeam) => {
        const team: Team = {
            id: teamObject.team.id,
            name: teamObject.team.name,
            code: teamObject.team.code,
            country: teamObject.team.country
        }
        return team
    })
    const count = await deps.insertManyTeams(teams)
    return count
}