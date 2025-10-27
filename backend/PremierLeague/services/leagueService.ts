import { Pool } from "pg";
import dotenv from 'dotenv'
import { League } from "../types/league";

dotenv.config()

const conn = new Pool({
    host: 'localhost',
    user: 'postgres',
    port: Number(process.env.PG_PORT),
    password: process.env.PG_PASSWORD,
    database: 'FantasyPL'
})

export const getAllLeagues = async () => {
    const fetch_query = 'SELECT * FROM leagues'
    const result = await conn.query(fetch_query)
    return result.rows
}

export const getLeagueById = async (leagueId: number) => {
    const fetch_query = 'SELECT * FROM leagues WHERE id = $1'
    const result = await conn.query(fetch_query, [leagueId])
    return result.rows[0]
}

export const insertLeague = async (league: League) => {
    const { id, name, base_country } = league
    const insert_query = 'INSERT INTO leagues (id, name, base_country) VALUES ($1,$2,$3) RETURNING *'
    const result = await conn.query(insert_query, [id, name, base_country])
    return result.rows[0]
}

export const deleteLeagueById = async (leagueId: number) => {
    const delete_query = 'DELETE FROM leagues WHERE id = $1'
    const result = await conn.query(delete_query, [leagueId])
    return result.rowCount
}

export const deleteAllLeagues = async () => {
    const delete_query = 'DELETE FROM leagues'
    const result = await conn.query(delete_query)
    return result.rowCount
}

export { conn }