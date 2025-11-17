import dotenv from 'dotenv'
import { NewSeason, Season } from '../../PremierLeague/types/seasons.js'
import axios from 'axios'
import { conn } from '../../utils/db.js'
import { seasonsRepo } from '../../PremierLeague/repos/seasonsRepo.js'

dotenv.config()

const getSeasonFromAPI = async (leagueId: number, startYear: number): Promise<NewSeason | null> => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/leagues', {
            headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
            },
            params:  {
                id: leagueId,
                season: startYear
            },
        })

        const data = response.data.response[0]
        const name = createSeasonString(startYear)
        const start_date = data.seasons[0].start.slice(0, 10)
        const end_date = data.seasons[0].end.slice(0, 10)

        const newSeason: NewSeason = {
            name: name,
            start_date: start_date,
            end_date: end_date,
            league_id: leagueId
        }
        return newSeason
    } catch (err) {
        console.error(err)
        return null
    }
}

const createSeasonString = (startYear: number): string => {
    const endYear = startYear + 1;
    
    const endYearShort = endYear.toString().slice(-2);
    
    return `${startYear}/${endYearShort}`;
};

export const addSeasonToDB = async (leagueId: number, startYear: number) => {
    try {
        const newSeason = await getSeasonFromAPI(leagueId, startYear)

        if (!newSeason) {
            throw new Error('Failed to fetch Season from API')
        }
        await seasonsRepo.insertSeason(newSeason)
        console.log(`Successfully inserted ${newSeason.name}`)
    } catch (err) {
        throw err
    } finally {
        await conn.end()
        console.log('Database connection closed')
    }
}