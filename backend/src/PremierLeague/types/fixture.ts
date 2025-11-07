export type Fixture = {
    id: number;
    season_id: number;
    gameweek: number;
    date: Date;
    home_team_id: number;
    away_team_id: number;
    status: string;
    home_goals: number;
    away_goals: number;  
}