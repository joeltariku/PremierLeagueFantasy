import { fileURLToPath } from 'url'
import { getStandingsFromSeason } from '../../../api-clients/standingsClient';

const __filename = fileURLToPath(import.meta.url);

const main = async () => {
    try {
        const seasonId = Number(process.argv[2])
        if (isNaN(seasonId)) {
            throw new Error('Please provide a season ID (Integer)')
        }
        const response = await getStandingsFromSeason(seasonId)
        console.log(response.response[0].league.standings)
    } catch (err) {
        console.error(err)
        process.exit(1)
    } 
}

if (import.meta.filename === __filename) {
  await main()
}