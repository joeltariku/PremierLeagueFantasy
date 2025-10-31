export interface APITeam {
    team: {
        id: number;
        name: string;
        code: string;
        country: string;
        founded: number;
        national: boolean;
        logo: string
    };
    venue: {
        id: number;
        name: string;
        address: string;
        city: string;
        capacity: number;
        surface: string;
        image: string;
    };
}

export interface TeamsAPIResponse {
    get: string;
    paramaters: Record<string, string>;
    errors: Record<string, string> | string[];
    results: number;
    paging: {
        current: number;
        total: number;
    };
    response: APITeam[];
}