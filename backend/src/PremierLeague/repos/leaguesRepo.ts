import { QueryResult, QueryResultRow } from "pg"
import { League } from "../types/league.js"
 import { conn } from "../../utils/db.js"

type DB = {
    query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>
}

export const makeLeaguesRepo = (db: DB) => {

    const getAllLeagues = async (): Promise<League[]> => {
        const fetch_query = 'SELECT * FROM leagues'
        const result = await db.query<League>(fetch_query)
        return result.rows
    }

    const getLeagueById = async (leagueId: number): Promise<League | undefined> => {
        const fetch_query = 'SELECT * FROM leagues WHERE id = $1'
        const result = await db.query<League>(fetch_query, [leagueId])
        return result.rows[0]
    }

    const insertLeague = async (league: League): Promise<League | undefined> => {
        const { id, name, base_country } = league
        const insert_query = 'INSERT INTO leagues (id, name, base_country) VALUES ($1,$2,$3) RETURNING *'
        const result = await db.query<League>(insert_query, [id, name, base_country])
        return result.rows[0]
    }

    const deleteLeagueById = async (leagueId: number): Promise<number> => {
        const delete_query = 'DELETE FROM leagues WHERE id = $1'
        const result = await db.query<League>(delete_query, [leagueId])
        return result.rowCount || 0
    }

    const deleteAllLeagues = async (): Promise<number> => {
        const delete_query = 'DELETE FROM leagues'
        const result = await db.query(delete_query)
        return result.rowCount || 0
    }

    return {
        getAllLeagues,
        getLeagueById,
        insertLeague,
        deleteLeagueById,
        deleteAllLeagues
    }
}

export const leaguesRepo = makeLeaguesRepo(conn)