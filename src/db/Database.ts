import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg"
// import { Schema } from "./schema/Schema"
import { DB } from "./schema/types"
import * as dotenv from 'dotenv'

dotenv.config()

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});