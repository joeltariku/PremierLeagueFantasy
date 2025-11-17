import { fileURLToPath } from 'url'
import { getFixturesFromSeason } from '../../api-clients/fixturesClient.js';


const __filename = fileURLToPath(import.meta.url);

const main = async () => {
    try {
        const seasonId = Number(process.argv[2])
        if (isNaN(seasonId)) {
            throw new Error('Please provide a season ID (Integer)')
        }
        console.log('Getting fixtures from season with id=', seasonId)
        const response = await getFixturesFromSeason(seasonId)
        console.log(response.response)
        const fixtures = response.response
    } catch (err) {
        console.error(err)
    } finally {
        process.exit(1)
    }
}

if (import.meta.filename === __filename) {
  await main()
}