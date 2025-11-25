import { QueryResult, QueryResultRow } from "pg"
import { Player } from "../types/player.js"
import { conn } from "../../utils/db.js"

type DB = {
    query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>
}

export const makePlayersRepo = (db: DB) => {
    const getPlayerById = async (playerId: number): Promise<Player | undefined> => {
        const fetch_query = 'SELECT * FROM players WHERE id = $1'
        const result = await db.query<Player>(fetch_query, [playerId])
        return result.rows[0]
    }

    const getPlayersByTeamId = async (teamId: number): Promise<Player[]> => {
        const fetch_query = 'SELECT * FROM players WHERE team_id = $1'
        const result = await db.query<Player>(fetch_query, [teamId])
        return result.rows
    }

    const insertPlayer = async (player: Player): Promise<Player | undefined> => {
        const { id, team_id, position_code, first_name, last_name, display_name, dob } = player
        const insert_query = 'INSERT INTO players (id, team_id, position_code, first_name, last_name, display_name, dob) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *'
        const result = await db.query<Player>(insert_query, [id, team_id, position_code, first_name, last_name, display_name, dob])
        return result.rows[0]
    }

    return {
        getPlayerById,
        getPlayersByTeamId,
        insertPlayer
    }    
}

export const playersRepo = makePlayersRepo(conn)