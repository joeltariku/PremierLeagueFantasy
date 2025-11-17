import { seasonsRepo } from "../../PremierLeague/repos/seasonsRepo.js"
import { conn } from "../../utils/db.js"

export const deleteSeason = async (name: string, leagueId: number) => {
    try {
        await seasonsRepo.deleteSeasonByLeagueIdAndName(name, leagueId)
        console.log(`Successfully deleted season with leagueId=${leagueId} from ${name}`)
    } catch (err) {
        throw err
    } finally {
        conn.end()
        console.log('Database connection closed')
    }
}