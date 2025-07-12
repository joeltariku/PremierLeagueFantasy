const express = require('express');
const axios = require('axios');
//const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3001;

//app.use(cors());
app.use(express.static('dist'))


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

app.listen(PORT, () => {
  console.log(`Proxy backend running on http://localhost:${PORT}`);
});
