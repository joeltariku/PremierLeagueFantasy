import { fileURLToPath } from 'url'
import { deleteSeason } from '../deleteSeason.js';

const __filename = fileURLToPath(import.meta.url);

if (import.meta.filename === __filename) {
    await deleteSeason('2024/25', 39)
}