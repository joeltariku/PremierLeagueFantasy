import Bottleneck from 'bottleneck'
import axios, { all } from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 200
})

let allPlayerIds = []

const getPlayerIdsFromTeamId = async (teamId) => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/players/squads', {
            headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
            },
            params:  {
                team: teamId
            },
        })

        const playerIds = response.data.response[0].players.map(player => player.id)
        // console.log(response.data.response)
        return playerIds
    } catch (err) {
        console.error(err)
    }
}

const getPlayerProfile = async (playerId) => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/players/profiles', {
            headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_KEY
            },
            params:  {
                player: playerId
            },
        })
        const profile = response.data?.response?.[0]?.player;
        console.log(profile)
    } catch (err) {
        console.error(err)
    }
}

// getPlayerIdsFromTeamId(33)

const wrap = limiter.wrap(getPlayerProfile)

const main = async () => {
    const team1PlayerIds = await getPlayerIdsFromTeamId(33)
    allPlayerIds = [...allPlayerIds, ...team1PlayerIds]
    const team2PlayerIds = await getPlayerIdsFromTeamId(34)
    allPlayerIds = [...allPlayerIds, ...team2PlayerIds]
    const team3PlayerIds = await getPlayerIdsFromTeamId(35)
    allPlayerIds = [...allPlayerIds, ...team3PlayerIds]
    const team4PlayerIds = await getPlayerIdsFromTeamId(36)
    allPlayerIds = [...allPlayerIds, ...team4PlayerIds]
    const team5PlayerIds = await getPlayerIdsFromTeamId(37)
    allPlayerIds = [...allPlayerIds, ...team5PlayerIds]
    const team6PlayerIds = await getPlayerIdsFromTeamId(38)
    allPlayerIds = [...allPlayerIds, ...team6PlayerIds]
    const team7PlayerIds = await getPlayerIdsFromTeamId(39)
    allPlayerIds = [...allPlayerIds, ...team7PlayerIds]
    const team8PlayerIds = await getPlayerIdsFromTeamId(40)
    allPlayerIds = [...allPlayerIds, ...team8PlayerIds]
    const team9PlayerIds = await getPlayerIdsFromTeamId(41)
    allPlayerIds = [...allPlayerIds, ...team9PlayerIds]
    const team10PlayerIds = await getPlayerIdsFromTeamId(42)
    allPlayerIds = [...allPlayerIds, ...team10PlayerIds]
    const team11PlayerIds = await getPlayerIdsFromTeamId(43)
    allPlayerIds = [...allPlayerIds, ...team11PlayerIds]
    const team12PlayerIds = await getPlayerIdsFromTeamId(44)
    allPlayerIds = [...allPlayerIds, ...team12PlayerIds]
    const team13PlayerIds = await getPlayerIdsFromTeamId(45)
    allPlayerIds = [...allPlayerIds, ...team13PlayerIds]
    const team14PlayerIds = await getPlayerIdsFromTeamId(46)
    allPlayerIds = [...allPlayerIds, ...team14PlayerIds]
    const team15PlayerIds = await getPlayerIdsFromTeamId(47)
    allPlayerIds = [...allPlayerIds, ...team15PlayerIds]
    const team16PlayerIds = await getPlayerIdsFromTeamId(48)
    allPlayerIds = [...allPlayerIds, ...team16PlayerIds]
    const team17PlayerIds = await getPlayerIdsFromTeamId(49)
    allPlayerIds = [...allPlayerIds, ...team17PlayerIds]
    const team18PlayerIds = await getPlayerIdsFromTeamId(50)
    allPlayerIds = [...allPlayerIds, ...team18PlayerIds]
    const team19PlayerIds = await getPlayerIdsFromTeamId(51)
    allPlayerIds = [...allPlayerIds, ...team19PlayerIds]
    const team20PlayerIds = await getPlayerIdsFromTeamId(52)
    allPlayerIds = [...allPlayerIds, ...team20PlayerIds]
}

await main()

allPlayerIds.forEach(playerId => {
    wrap(playerId)
})