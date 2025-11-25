import { QueryResult, QueryResultRow } from "pg"
import { Position } from "../types/position.js"

type DB = {
    query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>
}

export const makePositionsRepo = (db: DB) => {
    const getPositionByCode = async (code: string): Promise<Position> => {
        const fetch_query = 'SELECT name FROM positions WHERE code = $1'
        const result = await db.query<Position>(fetch_query, [code])
        return result.rows[0]
    }

    return {
        getPositionByCode
    }
}   