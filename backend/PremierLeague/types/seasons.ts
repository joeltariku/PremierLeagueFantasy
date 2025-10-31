export type Season = {
    id: number;
    name: string;
    start_date: Date;
    end_date: Date;
    league_id: number;
}

export type NewSeason = Omit<Season, 'id'>;