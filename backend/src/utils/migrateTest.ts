import { conn } from "./db.js"

const migrate = async () => {
    try {
        console.log(`Running mitagrations for NODE_ENV=${process.env.NODE_ENV}...`)

        await conn.query(`
            CREATE TABLE IF NOT EXISTS public.leagues
            (
                id integer NOT NULL,
                name character varying COLLATE pg_catalog."default" NOT NULL,
                base_country character varying COLLATE pg_catalog."default" NOT NULL,
                CONSTRAINT leagues_pkey PRIMARY KEY (id)
            )`
        )

        await conn.query(`
            CREATE TABLE IF NOT EXISTS public.teams
            (
                id integer NOT NULL,
                name character varying COLLATE pg_catalog."default" NOT NULL,
                code character varying COLLATE pg_catalog."default" NOT NULL,
                country character varying COLLATE pg_catalog."default" NOT NULL,
                CONSTRAINT teams_pkey PRIMARY KEY (id)
            )`
        )

        await conn.query(`
            CREATE TABLE IF NOT EXISTS public.seasons
            (
                id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
                name character varying COLLATE pg_catalog."default" NOT NULL,
                start_date date NOT NULL,
                end_date date NOT NULL,
                league_id integer,
                CONSTRAINT seasons_pkey PRIMARY KEY (id),
                CONSTRAINT unqieu_seasons_name_league_id UNIQUE (name, league_id),
                CONSTRAINT seasons_league_id_fkey FOREIGN KEY (league_id)
                    REFERENCES public.leagues (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
            )`
        )

        await conn.query(`
            CREATE TABLE IF NOT EXISTS public.team_seasons
            (
                season_id integer NOT NULL,
                team_id integer NOT NULL,
                points integer NOT NULL,
                rank integer NOT NULL,
                goals_scored integer NOT NULL,
                goals_conceded integer NOT NULL,
                CONSTRAINT team_seasons_pkey PRIMARY KEY (season_id, team_id),
                CONSTRAINT season_id_fk FOREIGN KEY (season_id)
                    REFERENCES public.seasons (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE,
                CONSTRAINT team_id_fk FOREIGN KEY (team_id)
                    REFERENCES public.teams (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE
            )`
        )

        await conn.query(`
            CREATE TABLE IF NOT EXISTS public.fixtures
            (
                id integer NOT NULL,
                season_id integer NOT NULL,
                gameweek integer NOT NULL,
                date timestamp with time zone NOT NULL,
                home_team_id integer NOT NULL,
                away_team_id integer NOT NULL,
                status character varying COLLATE pg_catalog."default" NOT NULL,
                home_goals integer NOT NULL DEFAULT 0,
                away_goals integer NOT NULL DEFAULT 0,
                CONSTRAINT fixtures_pkey PRIMARY KEY (id),
                CONSTRAINT unique_away_team_id_for_season_gameweek UNIQUE (season_id, gameweek, away_team_id),
                CONSTRAINT unique_home_team_id_for_season_gameweek UNIQUE (season_id, gameweek, home_team_id),
                CONSTRAINT away_team_id FOREIGN KEY (away_team_id)
                    REFERENCES public.teams (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION,
                CONSTRAINT home_team_id_fk FOREIGN KEY (home_team_id)
                    REFERENCES public.teams (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION,
                CONSTRAINT season_id_fk FOREIGN KEY (season_id)
                    REFERENCES public.seasons (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE,
                CONSTRAINT "home_team_id_DNE_away_team_id" CHECK (home_team_id <> away_team_id)
            )`
        )
        
        console.log('Migrations finished')
    } catch (err) {
        console.error(err)
    } finally {
        conn.end()
    }
}

migrate()