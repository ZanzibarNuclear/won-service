import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg"
import { DB as supaDB } from "./supaTypes"
import * as dotenv from 'dotenv'

dotenv.config()

export const db = new Kysely<supaDB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.SUPABASE_URL,
    }),
  }),
});