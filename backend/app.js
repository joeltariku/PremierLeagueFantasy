const express = require('express');
const axios = require('axios');
//const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const Team = require('./PremierLeague/models/team')
const teamsRouter = require('./PremierLeague/controllers/team')

dotenv.config();


const app = express();

//app.use(cors());
app.use(express.static('dist'))

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.info('Connected to MongoDB')
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message)
});

app.get('/api/topscorers', async (req, res) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/players/topscorers', {
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_KEY,
      },
      params: req.query, 
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error calling external API:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/api/allplayers', async (req, res) => {
  try {
    const teamResponse = await axios.get('https://v3.football.api-sports.io/teams', {
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_KEY
      }, 
      params: req.query,
    });

    const teams = teamResponse.data.response;

    const playerPromises = teams.map(team => 
      axios.get(`https://v3.football.api-sports.io/players/squads?team=${team.team.id}`, {
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': process.env.API_KEY
        }
      }).then(res => res.data)
    )

    const allPlayers = await Promise.all(playerPromises)

    res.json(allPlayers)
  } catch (err) {
    console.error('Error calling external API:', err.message);
    res.status(500).json({ error: err.message })
  }
})

app.use('/api/premierleague', teamsRouter)

module.exports = app