import { QueryResult, QueryResultRow } from "pg"
import { conn } from "../../utils/db"
import { Team } from "../types/teams"

type DB = {
    query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>
}

export const makeTeamsRepo = (db: DB) => {
    const getAllTeams = async (): Promise<Team[]> => {
        const fetch_query = 'SELECT * FROM teams'
        const result = await db.query<Team>(fetch_query)
        return result.rows
    }
    
    const getTeamById = async (teamId: number): Promise<Team | undefined> => {
        const fetch_query = 'SELECT * FROM teams WHERE id = $1'
        const result = await db.query<Team>(fetch_query, [teamId])
        return result.rows[0]
    }
    
    const insertTeam = async (team: Team) => {
        const { id, name, code, country } = team
        const insert_query= 'INSERT INTO public.teams (id, name, code, country) VALUES ($1,$2,$3,$4) RETURNING *'
        const result= await db.query(insert_query, [id, name, code, country])
        return result.rows[0]
    }
    
    const insertManyTeams = async (teams: Team[]): Promise<number> => {
        if (teams.length === 0) return 0
        let count = 0;
    
        for (const team of teams) {
            const existingTeam = await getTeamById(team.id)
            if (!existingTeam) {
                await insertTeam(team)
                count++;
            }
        }
        return count;
    }

    return {
        getAllTeams,
        getTeamById,
        insertTeam,
        insertManyTeams
    }
}

export const teamsRepo = makeTeamsRepo(conn)