import axios, { AxiosRequestConfig } from "axios";
import * as addLeagueModule from "./addLeague.js";
import { conn } from "../../utils/db.js";
import { leaguesRepo } from "../../PremierLeague/repos/leaguesRepo.js";

leaguesRepo

jest.mock('axios')

jest.mock('../../PremierLeague/repos/leaguesRepo', () => ({
    leaguesRepo: {
        insertLeague: jest.fn()
    }
}))

jest.mock('../../utils/db', () => ({
    conn: { end: jest.fn() }
}))

const mockInsertLeague = leaguesRepo.insertLeague as jest.MockedFunction<typeof leaguesRepo.insertLeague>


describe('testing script to add a league to the database using api', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('addLeagueToDB', () => {
        it('inserts league when fetched successfully', async () => {
            (axios.get as jest.Mock).mockImplementation((url: string, options: AxiosRequestConfig<any>) => {
                const id = options.params.id
                return Promise.resolve({
                    data: {
                        response: [
                            {
                                league: { id, name: 'Premier League' },
                                country: { name: 'England'}
                            }
                        ]
                    }
                })
            })

            await addLeagueModule.addLeagueToDB(39)

            expect(mockInsertLeague).toHaveBeenCalledWith({
                id: 39,
                name: 'Premier League',
                base_country: 'England'
            })

            expect(conn.end).toHaveBeenCalled()
        })
        it('throws correct error when getLeagueFromAPI call fails', async () => {
            (axios.get as jest.Mock).mockRejectedValue(new Error())

            await expect(addLeagueModule.addLeagueToDB(39)).rejects.toThrow('Failed to fetch League from API')
            expect(conn.end).toHaveBeenCalled()
        })
        it('throws correct error when call to insertLeague fails', async () => {
            (axios.get as jest.Mock).mockImplementation((url: string, options: AxiosRequestConfig<any>) => {
                const id = options.params.id
                return Promise.resolve({
                    data: {
                        response: [
                            {
                                league: { id, name: 'Premier League' },
                                country: { name: 'England'}
                            }
                        ]
                    }
                })
            });
            (mockInsertLeague as jest.Mock).mockRejectedValue(new Error('League with id already exists'))

            await expect(addLeagueModule.addLeagueToDB(39)).rejects.toThrow('League with id already exists')
            expect(conn.end).toHaveBeenCalled()
        })
    })  
})