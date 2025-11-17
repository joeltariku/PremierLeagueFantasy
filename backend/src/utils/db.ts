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

const buildPool = (): Pool => {
    const config: PoolConfig = {
        host: 'localhost',
        user: 'postgres',
        port: Number(process.env.PG_PORT),
        password: process.env.PG_PASSWORD,
        database: isTest ? 'FantasyPL_Test' : 'FantasyPL'
    }
    const pool = new Pool(config)

    // pool.on('connect', () => {
    //     pool.query('SELECT current_database()').then(result => {
    //         console.log(`Connected to database: ${result.rows[0].current_database}`)
    //     })
    // })

    // pool.on('error', (err) => {
    //     console.error('Unexpected error on idle client', err)
    //     process.exit(-1)
    // })

    ended = false
    return pool
}

export const getPool = (): Pool => {
  if (pool && !ended) return pool;
  pool = buildPool();
  return pool;
}

export const closePool = async (): Promise<void> => {
  if (pool && !ended) {
    ended = true;
    try {
      await pool.end();
    } catch {
      /* ignore during teardown */
    }
  }
  pool = null;
  ended = false; // allow recreation (e.g., Jest watch)
}
conn.on('connect', () => {
    conn.query('SELECT current_database()').then(result => {
        console.log(`Connected to database: ${result.rows[0].current_database}`)
    })
})

conn.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

// const testConn = new Pool({
//     host: 'localhost',
//     user: 'postgres',
//     port: Number(process.env.PG_PORT),
//     password: process.env.PG_PASSWORD,
//     database: 'FantasyPL_test'
// })

export { conn }