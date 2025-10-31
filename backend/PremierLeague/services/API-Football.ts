import { APIError } from "../types/API-Football/error";

export const getErrorMessages = (errors: APIError): string[] => {
    if (Array.isArray(errors)) return errors
    if (typeof errors === 'object') return Object.values(errors)
    return []
}