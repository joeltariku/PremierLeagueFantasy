import express, { Request, Response } from 'express';
import dotenv from 'dotenv'
import leaguesRouter from './PremierLeague/controllers/leagues.js';
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./swagger.yaml')


dotenv.config();


const app = express();

app.use(express.static('dist'))
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api/leagues', leaguesRouter)

//testing workflow

export default app