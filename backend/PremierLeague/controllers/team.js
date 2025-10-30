import Team from '../models/team.js'
import express from 'express';
const teamsRouter = express.Router()
import axios from 'axios';

teamsRouter.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find({})
        res.json(teams);
    } catch (err) {
        console.error('error: ', err.message)
        res.status(500).json({ error: err.message })
    }
});

teamsRouter.post('/teams', async (req, res) => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/teams', {
            headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
            },
            params: req.query,
        })

        const teams = response.data.response;
        const promiseArray = teams.map(team => {
            console.log(team)
            const newTeam = new Team(team)
            return newTeam.save()
        })
        
        const allTeams = await Promise.all(promiseArray)
        return res.json(allTeams)
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.log(err)
            return res.status(500).json({ error: `The following error with axios occured: ${err.message}`})
        } else {
            return res.status(500).json({ error: err.message })
        }
    }
})

teamsRouter.get('/teams/:teamid', async (req, res) => {
  try {
    const { teamid } = req.params;

    const team = await Team.findOne({ 'team.id': Number(teamid) })
    if (!team) {
        return res.status(404).json({ error: "No team exists with this id" })
    }
    res.json(team)
  } catch (err) {
    console.error('Error calling service: ', err.message);
    res.status(500).json({ error: err.message })
  }
})

teamsRouter.delete('/teams', async (req, res) => {
  await Team.deleteMany()
  res.status(201).end();
})

export default teamsRouter