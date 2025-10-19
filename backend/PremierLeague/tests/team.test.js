// const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const Team = require('../models/team')
const axios = require('axios')

jest.mock('axios', () => {
    const actual = jest.requireActual('axios')

    return {
        ...actual,
        get: jest.fn(),
        default: {...actual, get: jest.fn() },
    }
})



const api = supertest(app)

const teams = [
    {
        team: {
            id: 33,
            name: "Manchester United",
            code: "MUN",
            country: "England",
            founded: 1878,
            national: false,
            logo: "https://media.api-sports.io/football/teams/33.png"
        },
            venue: {
            id: 556,
            name: "Old Trafford",
            address: "Sir Matt Busby Way",
            city: "Manchester",
            capacity: 76212,
            surface: "grass",
            image: "https://media.api-sports.io/football/venues/556.png",
            }
    }, 
    {
        team: {
            id: 34,
            name: "Newcastle",
            code: "NEW",
            country: "England",
            founded: 1892,
            national: false,
            logo: "https://media.api-sports.io/football/teams/34.png"
        },
        venue: {
            id: 562,
            name: "St. James' Park",
            address: "St. James' Street",
            city: "Newcastle upon Tyne",
            capacity: 52758,
            surface: "grass",
            image: "https://media.api-sports.io/football/venues/562.png"
        }
    }
]

describe('Testing the /api/premierleague/teams endpoint', () => {
    afterEach(async () => {
        jest.restoreAllMocks()
    })

    describe('Testing the api to get all teams', () => {
        beforeEach(async () => {
            await Team.deleteMany();
            let teamObject = new Team(teams[0])
            await teamObject.save()
            teamObject = new Team(teams[1])
            await teamObject.save()
        })

        test('teams are returned as json', async () => {
            await api
                .get('/api/premierleague/teams')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })

        test('all teams are returned', async () => {
            const response = await api.get('/api/premierleague/teams')

            expect(response.body.length).toBe(teams.length)
        })

        test('error is handled correctly when failing to get premierleague teams', async () => {
            // Team.find.mockRejectedValue(new Error("Error"))
            jest.spyOn(Team, 'find').mockRejectedValue(new Error("Error"))
            const response = await api
            .get('/api/premierleague/teams')
            
            expect(response.status).toBe(500)
            expect(response.body.error).toBe("Error")
        })
    })
    describe('Testing the api to get a single team', () => {
        beforeEach(async () => {
            await Team.deleteMany();
            let teamObject = new Team(teams[0])
            await teamObject.save()
            teamObject = new Team(teams[1])
            await teamObject.save()
        })

        test('Using the team id parameter gets the correct team', async () => {
            const response = await api.get('/api/premierleague/teams/33')

            expect(response.status).toBe(200)
            expect(response.body.team.name).toBe("Manchester United")
        })
        test('when no team with the id is found 404 is returned', async () => {
            const response = await api.get('/api/premierleague/teams/36')

            expect(response.status).toBe(404)
            expect(response.body.error).toBe("No team exists with this id")
        })
        test('when Team.findOne has an error then 500 is returned with error message', async () => {
            jest.spyOn(Team, 'findOne').mockRejectedValue(new Error("Error"))

            const response = await api.get('/api/premierleague/teams/33')
            expect(response.status).toBe(500)
            expect(response.body.error).toBe("Error")
        })
    })
    describe('Testing the api post teams', () => {
        test('Posting a list of teams properly updates server', async () => {
            axios.get.mockResolvedValue({ 
                data: {
                    response: teams
                }
        
            })
            const response = await api
                .post('/api/premierleague/teams')
                .query({ league: 39, season: 2025 })
                .expect(200);

            console.log(response.body)

            expect(response.body.length).toBe(teams.length)
        })
        test('Error is handled correctly when call to get the teams that will be posted fails', async () => {
            axios.get.mockRejectedValue({
                isAxiosError: true,
                message:  'Request failed with status code 404',
                response: {
                    status: 404,
                    data: {
                        error: "Not found"
                    }
                }
            })

            const response = await api
                .post('/api/premierleague/teams')
                .query({ league: 39, season: 2025 })
                .expect(500)

            expect(response.body.error).toBe("The following error with axios occured: Request failed with status code 404")
        })
        test('Error is handled correctly saving teams fails', async () => {
            jest.spyOn(Team.prototype, 'save').mockRejectedValue(new Error("Cannot save Team object"))
            axios.get.mockResolvedValue({ 
                data: {
                    response: teams
                }
            })

            const response = await api
                .post('/api/premierleague/teams')
                .query({ league: 39, season: 2025 })
                .expect(500);

            expect(response.body.error).toBe("Cannot save Team object")
        })
    })
    describe('Testing the api to delete teams', () => {
        beforeEach(async () => {
            await Team.deleteMany();
            let teamObject = new Team(teams[0])
            await teamObject.save()
            teamObject = new Team(teams[1])
            await teamObject.save()
        })
        test('After calling the delete endpoint there are no teams in the server', async () => {
            const initialTeams = await api
                .get('/api/premierleague/teams')
                .expect(200)

            expect(initialTeams.body.length).toBe(2)

            await api
                .delete('/api/premierleague/teams')
                .expect(201)

            const finalTeams = await api  
                .get('/api/premierleague/teams')
                .expect(200)

            expect(finalTeams.body.length).toBe(0)
        })
    })
    afterAll(async () => {
        await mongoose.connection.close()
    })
})