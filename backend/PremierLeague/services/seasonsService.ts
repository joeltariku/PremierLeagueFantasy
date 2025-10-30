import dotenv from 'dotenv'
import { NewSeason, Season } from '../../PremierLeague/types/seasons'
import { conn } from '../../utils/db'

dotenv.config()

export const insertSeason = async (season: NewSeason) =>  {
    const { name, start_date, end_date, league_id } = season
    const insert_query = 'INSERT INTO seasons (name, start_date, end_date, league_id) VALUES ($1,$2,$3,$4) RETURNING *'
    const result = await conn.query(insert_query, [name, start_date, end_date, league_id])
    return result.rows[0]
}

export const deleteSeasonByLeagueIdAndName = async (name: string, league_id: number) => {
    const delete_query = 'DELETE FROM seasons WHERE league_id = $1 and name = $2'
    const result = await conn.query(delete_query, [league_id, name])
    return result.rowCount
}