import { fileURLToPath } from 'url'
import { addSeasonToDB } from '../addSeason.js';

const __filename = fileURLToPath(import.meta.url);

if (import.meta.filename === __filename) {
    await addSeasonToDB(39, 2024)
}