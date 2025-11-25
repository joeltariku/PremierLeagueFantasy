import express, { Request, Response } from 'express';
import dotenv from 'dotenv'
import  { makeLeaguesRouter } from './PremierLeague/controllers/leagues.js';
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs';
import { DB, makeSeasonsRepo } from './PremierLeague/repos/seasonsRepo.js';
import { conn } from './utils/db.js';
import { makeLeaguesRepo } from './PremierLeague/repos/leaguesRepo.js';
import { makeTeamsRepo } from './PremierLeague/repos/teamsRepo.js';
import { makeSeasonsRouter } from './PremierLeague/controllers/seasons.js';
import { makeTeamsRouter } from './PremierLeague/controllers/teams.js';
import { makeTeamSeasonsRepo } from './PremierLeague/repos/teamSeasonsRepo.js';
import { makeTeamSeasonsRouter } from './PremierLeague/controllers/teamSeasons.js';
import { makeFixturesRepo } from './PremierLeague/repos/fixturesRepo.js';
import { makeFixturesRouter } from './PremierLeague/controllers/fixtures.js';
import { makePositionsRepo } from './PremierLeague/repos/positionsRepo.js';
import { makePlayersRepo } from './PremierLeague/repos/playersRepo.js';

const swaggerDocument = YAML.load('./swagger.yaml')


dotenv.config();

type BuildAppOptions = {
    db: DB,
    leaguesRepo?: ReturnType<typeof makeLeaguesRepo>,
    seasonsRepo?: ReturnType<typeof makeSeasonsRepo>,
    teamsRepo?: ReturnType<typeof makeTeamsRepo>,
    teamSeasonsRepo?: ReturnType<typeof makeTeamSeasonsRepo>,
    fixturesRepo?: ReturnType<typeof makeFixturesRepo>,
    posotionsRepo?: ReturnType<typeof makePositionsRepo>,
    playersRepo?: ReturnType<typeof makePlayersRepo>,
}

export const buildApp = (options: BuildAppOptions = {db: conn}) => {
    const { db } = options

    const leaguesRepo = options.leaguesRepo ?? makeLeaguesRepo(db)
    const leaguesRouter = makeLeaguesRouter(leaguesRepo)

    const seasonsRepo = options.seasonsRepo ?? makeSeasonsRepo(db)
    const seasonsRouter = makeSeasonsRouter(seasonsRepo)

    const teamsRepo = options.teamsRepo ?? makeTeamsRepo(db)
    const teamsRouter = makeTeamsRouter(teamsRepo)

    const teamSeasonsRepo = options.teamSeasonsRepo ?? makeTeamSeasonsRepo(db)
    const teamSeasonsRouter = makeTeamSeasonsRouter(teamSeasonsRepo)

    const fixturesRepo = options.fixturesRepo ?? makeFixturesRepo(db)
    const fixturesRouter = makeFixturesRouter(fixturesRepo)

    const app = express();

    app.use(express.static('dist'))
    app.use(express.json())
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    app.use('/api/leagues', leaguesRouter)
    app.use('/api/teams', teamsRouter)
    app.use('/api/seasons', seasonsRouter)
    app.use('/api/teamSeasons', teamSeasonsRouter)
    app.use('/api/fixtures', fixturesRouter)

    app.get('/health', (req, res) => {
    res.send('ok')
    })

    app.get('/version', (req, res) => {
        res.send('1')
    })
    return app
}

const app = buildApp()
export default app