import { APIResponse } from "./response";

export interface APIFixture {
    fixture: {
        id: number;
        referee: string;
        timezone: string;
        date: string;
        timestamp: number | null;
        periods: {
            first: number | null;
            second: number | null;
        };
        venue: {
            id: number;
            name: string;
            city: string;
        };
        status: {
            long: string;
            short: string;
            elapsed: number | null;
            extra: number | null;
        }
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        flag: string;
        season: number;
        round: string;
        standings: boolean;
    };
    teams: {
        home: {
            id: number;
            name: string;
            logo: string;
            winner: boolean | null;
        };
        away: {
            id: number;
            name: string;
            logo: string;
            winner: boolean | null;
        }
    };
    goals: {
        home: number | null;
        away: number | null;
    }; 
    score: {
        halftime: {
            home: number | null;
            away: number | null;
        };
        fulltime: {
            home: number | null;
            away: number | null;
        };
        extratime: {
            home: number | null;
            away: number | null;
        };
        penalty: {
            home: number | null;
            away: number | null;
        };
    };
}

export type FixtureAPIResposne = APIResponse<APIFixture>