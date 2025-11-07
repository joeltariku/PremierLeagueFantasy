import { conn } from "../../utils/db";
import { TeamSeason } from "../types/teamSeason";

export const insertTeamSeason = async (teamSeason: TeamSeason): Promise<TeamSeason> => {
    const { season_id, team_id, points, rank, goals_scored, goals_conceded } = teamSeason
    const insert_query = 'INSERT INTO team_seasons (season_id, team_id, points, rank, goals_scored, goals_conceded) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *'
    const result = await conn.query(insert_query, [season_id, team_id, points, rank, goals_scored, goals_conceded])
    return result.rows[0]
}

const insertTeamSeasons = async (teamSeasons: TeamSeason[]): Promise<number> => {
    if (teamSeasons.length === 0) return 0
    let count = 0


    return count
}