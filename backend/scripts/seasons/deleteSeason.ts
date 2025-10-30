import { deleteSeasonByLeagueIdAndName } from "../../PremierLeague/services/seasonsService"
import { conn } from "../../utils/db"


export const deleteSeason = async (name: string, leagueId: number) => {
    try {
        await deleteSeasonByLeagueIdAndName(name, leagueId)
        console.log(`Successfully deleted season with leagueId=${leagueId} from ${name}`)
    } catch (err) {
        throw err
    } finally {
        conn.end()
        console.log('Database connection closed')
    }
}