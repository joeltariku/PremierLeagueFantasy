import { QueryResult, QueryResultRow } from "pg"
import { NewSeason, Season } from "../types/seasons.js"
import { conn } from "../../utils/db.js"

export type DB = {
    query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>
}

export const makeSeasonsRepo = (db: DB) => {
    const insertSeason = async (season: NewSeason): Promise<Season> =>  {
        const { name, start_date, end_date, league_id } = season
        const insert_query = 'INSERT INTO seasons (name, start_date, end_date, league_id) VALUES ($1,$2,$3,$4) RETURNING *'
        const result = await db.query<Season>(insert_query, [name, start_date, end_date, league_id])
        return result.rows[0]
    }

    const deleteSeasonByLeagueIdAndName = async (name: string, league_id: number): Promise<number | null> => {
        const delete_query = 'DELETE FROM seasons WHERE league_id = $1 and name = $2'
        const result = await db.query<Season>(delete_query, [league_id, name])
        return result.rowCount
    }

    const getSeasonById = async (seasonId: number): Promise<Season | undefined> => {
        const fetch_query = 'SELECT * FROM seasons WHERE id = $1'
        const result = await db.query<Season>(fetch_query, [seasonId])
        return result.rows[0]
    }

    return {
        insertSeason,
        deleteSeasonByLeagueIdAndName,
        getSeasonById
    }
}

export const seasonsRepo = makeSeasonsRepo(conn)