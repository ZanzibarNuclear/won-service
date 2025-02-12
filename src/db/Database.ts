import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely";
import { Pool } from "pg"
import { DB } from "./types"
import * as dotenv from 'dotenv'

dotenv.config()

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL
    }),
  }),
  plugins: [new CamelCasePlugin()]
});