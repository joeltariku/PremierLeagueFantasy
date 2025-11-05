import { fileURLToPath } from 'url'
import { updateFixturesFromSeasonGW } from '../../PremierLeague/services/fixturesService';
import { conn } from '../../utils/db';

const __filename = fileURLToPath(import.meta.url);

const main = async () => {
    try {
        const seasonId = Number(process.argv[2])
        if (isNaN(seasonId)) {
            throw new Error('Please provide a season ID (Integer)')
        }

        const gameweek = Number(process.argv[3])
        if (isNaN(gameweek)) {
            throw new Error('Please provide a gameweek (Integer)')
        }

        const count = await updateFixturesFromSeasonGW(seasonId, gameweek)
        console.log(`Updated ${count} fixtures for season ${seasonId} in gameweek ${gameweek}`)
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