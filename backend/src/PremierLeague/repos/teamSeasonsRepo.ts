import { QueryResult, QueryResultRow } from "pg"
import { TeamSeason } from "../types/teamSeason"
import { conn } from "../../utils/db"

type DB = {
    query: <T extends QueryResultRow>(text: string, params?: any[]) => Promise<QueryResult<T>>
}

export const makeTeamSeasonsRepo = (db: DB) => {
    const getTeamSeasonBySeasonIdAndTeamId = async (seasonId: number, teamId: number): Promise<TeamSeason | undefined> => {
        const fetch_query = 'SELECT * FROM team_seasons WHERE season_id = $1 AND team_id = $2'
        const result = await db.query<TeamSeason>(fetch_query, [seasonId, teamId])
        return result.rows[0]
    }
    const insertTeamSeason = async (teamSeason: TeamSeason): Promise<TeamSeason> => {
        const { season_id, team_id, points, rank, goals_scored, goals_conceded } = teamSeason
        const insert_query = 'INSERT INTO team_seasons (season_id, team_id, points, rank, goals_scored, goals_conceded) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *'
        const result = await db.query<TeamSeason>(insert_query, [season_id, team_id, points, rank, goals_scored, goals_conceded])
        return result.rows[0]
    }

    const insertTeamSeasons = async (teamSeasons: TeamSeason[]): Promise<number> => {
        if (teamSeasons.length === 0) return 0
        let count = 0
        for (const teamSeason of teamSeasons) {
            const existingTeamSeason = await getTeamSeasonBySeasonIdAndTeamId(teamSeason.season_id, teamSeason.team_id)
            if (!existingTeamSeason) {
                await insertTeamSeason(teamSeason)
                count++
            }
        }
        return count
    }

    return {
        getTeamSeasonBySeasonIdAndTeamId,
        insertTeamSeason,
        insertTeamSeasons
    }
}

export const teamSeasonsRepo = makeTeamSeasonsRepo(conn)