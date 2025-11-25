import { APIResponse } from "./response.js";

export interface APIPlayer {
    player: {
        id: number;
        name: string;
        firstname: string;
        lastname: string;
        age: number;
        birth: {
            date: string;
            place: string;
            country: string;
        };
        nationality: string;
        height: string;
        weight: string;
        injured: boolean;
        photo: string;
    }
}   

export interface APIPlayerProfile {
    player: {
        id: number;
        name: string;
        firstname: string;
        lastname: string;
        age: number;
        birth: {
            date: string;
            place: string;
            country: string;
        };
        nationality: string;
        height: string;
        weight: string;
        number: number;
        position: string;
        photo: string;
    }
}

export type PlayersAPIResponse = APIResponse<APIPlayer> 

export type PlayerProfileAPIResponse = APIResponse<APIPlayerProfile>