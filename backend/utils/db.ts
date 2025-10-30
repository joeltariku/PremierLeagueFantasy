import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config()

const conn = new Pool({
    host: 'localhost',
    user: 'postgres',
    port: Number(process.env.PG_PORT),
    password: process.env.PG_PASSWORD,
    database: 'FantasyPL'
})

export { conn }