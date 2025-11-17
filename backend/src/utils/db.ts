import dotenv from "dotenv";
import { Pool, PoolConfig } from "pg";

dotenv.config()

let pool: Pool | null = null;
let ended = false;

const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

const conn = new Pool({
    host: 'localhost',
    user: 'postgres',
    port: Number(process.env.PG_PORT),
    password: process.env.PG_PASSWORD,
    database: isTest ? 'FantasyPL_Test' : 'FantasyPL'
})

conn.on('connect', () => {
    conn.query('SELECT current_database()').then(result => {
        console.log(`Connected to database: ${result.rows[0].current_database}`)
    })
})

conn.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

export { conn }