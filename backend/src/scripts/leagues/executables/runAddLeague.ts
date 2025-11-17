import { fileURLToPath } from 'url'
import { addLeagueToDB } from "../addLeague.js";

const __filename = fileURLToPath(import.meta.url);

if (import.meta.filename === __filename) {
  await addLeagueToDB(39); //Added Premier League to DB
}