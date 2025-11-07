export interface APIResponse<T> {
    get: string;
    parameters: Record<string, string>;
    errors: Record<string, string> | string[];
    results: number;
    paging: {
        current: number;
        total: number;
    };
    response: T[];
}