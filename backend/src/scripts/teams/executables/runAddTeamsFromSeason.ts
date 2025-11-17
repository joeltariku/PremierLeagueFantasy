import { fileURLToPath } from 'url'
import { conn } from '../../../utils/db';
import { TeamsService } from '../../../PremierLeague/services/teamsService';

const __filename = fileURLToPath(import.meta.url);

const main = async () => {
    try {
        const seasonId = Number(process.argv[2])
        if (isNaN(seasonId)) {
            throw new Error('Please provide a season ID (Integer)')
        }
        const count = await TeamsService.addTeamsForSeason(seasonId)
        console.log(`Inserted ${count} teams for season ${seasonId}`)
    } catch (err) {
        console.error(err)
        process.exit(1)
    } finally {
        await conn.end()
        console.log('Database connection closed')
    }
}

if (import.meta.filename === __filename) {
  await main()
}