import express, { Request, Response } from 'express';
import axios from 'axios';
//const cors = require('cors');
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import Team from './PremierLeague/models/team.js'
import teamsRouter from './PremierLeague/controllers/team.js'
import leaguesRouter from './PremierLeague/controllers/leagues.ts';
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./swagger.yaml')


dotenv.config();


const app = express();

//app.use(cors());
app.use(express.static('dist'))
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// mongoose.connect(process.env.MONGODB_URI!).then(() => {
//     console.info('Connected to MongoDB')
// }).catch((error) => {
//     console.error('Error connecting to MongoDB:', error.message)
// });

// app.get('/api/topscorers', async (req: Request, res: Response) => {
//   try {
//     const response = await axios.get('https://v3.football.api-sports.io/players/topscorers', {
//       headers: {
//         'x-rapidapi-host': 'v3.football.api-sports.io',
//         'x-rapidapi-key': process.env.API_KEY,
//       },
//       params: req.query, 
//     });

//     res.json(response.data);
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error('Error calling external API:', err.message);
//       res.status(500).json({ error: 'Something went wrong' });
//     } else {
//       console.error('Unexpected error:', err);
//       res.status(500).json({ error: 'An unexpected error occurred' });
//     }
//   }
// });

// app.get('/api/allplayers', async (req, res) => {
//   try {
//     const teamResponse = await axios.get('https://v3.football.api-sports.io/teams', {
//       headers: {
//         'x-rapidapi-host': 'v3.football.api-sports.io',
//         'x-rapidapi-key': process.env.API_KEY
//       }, 
//       params: req.query,
//     });

//     const teams = teamResponse.data.response;

//     const playerPromises = teams.map(team => 
//       axios.get(`https://v3.football.api-sports.io/players/squads?team=${team.team.id}`, {
//         headers: {
//           'x-rapidapi-host': 'v3.football.api-sports.io',
//           'x-rapidapi-key': process.env.API_KEY
//         }
//       }).then(res => res.data)
//     )

//     const allPlayers = await Promise.all(playerPromises)

//     res.json(allPlayers)
//   } catch (err) {
//     console.error('Error calling external API:', err.message);
//     res.status(500).json({ error: err.message })
//   }
// })

app.use('/api/premierleague', teamsRouter)
app.use('/api/leagues', leaguesRouter)

export default app