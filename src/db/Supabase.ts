import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg"
import { DB } from "./supaTypes"
import * as dotenv from 'dotenv'

dotenv.config()

export const supaDB = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.SUPABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }),
  }),
});