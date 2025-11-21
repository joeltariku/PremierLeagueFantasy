export type Season = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    league_id: number;
}

export type NewSeason = Omit<Season, 'id'>;