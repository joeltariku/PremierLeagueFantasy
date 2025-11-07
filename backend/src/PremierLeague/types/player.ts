export type Player = {
    id: number;
    team_id: number;
    position_id: number;
    first_name: string | undefined | null;
    last_name: string | undefined | null;
    display_name: string;
    dob: Date;
}