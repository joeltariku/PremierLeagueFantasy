import axios from "axios";
import dotenv from 'dotenv'
import { League } from "../../PremierLeague/types/league.js";
import { conn } from "../../utils/db.js";
import { leaguesRepo } from "../../PremierLeague/repos/leaguesRepo.js";

dotenv.config()

const getLeagueFromAPI = async (id: number): Promise<League | null> => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/leagues', {
            headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
            },
            params:  {
                id: id
            },
        })

        const league: League = {
            id: response.data.response[0].league.id,
            name: response.data.response[0].league.name,
            base_country: response.data.response[0].country.name
        }
        return league
    } catch (err) {
        console.error(err)
        return null
    }
}

export const addLeagueToDB = async (leagueId: number) => {
    try {
        const league = await getLeagueFromAPI(leagueId)

        if (!league) {
            throw new Error('Failed to fetch League from API')
        }
        await leaguesRepo.insertLeague(league)
        console.log(`Successfully inserted: ${league.name}`)
    } catch (err) {
        throw err
    } finally {
        await conn.end()
        console.log('Database connections closed')
    }
}