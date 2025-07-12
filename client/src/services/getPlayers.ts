import axios from 'axios'

const baseUrl = "/api/topscorers"

const getTopScorers = async (season: number, leagueId: number) => {
    const topScorers = 
        await axios
            .get(baseUrl,  {
                params: {
                    season: season,
                    league: leagueId
                }
            })
    return topScorers.data;
}

export default { getTopScorers }