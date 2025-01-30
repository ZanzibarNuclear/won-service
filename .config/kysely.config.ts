import {
	DummyDriver,
	PostgresAdapter,
	PostgresIntrospector,
	PostgresQueryCompiler,
} from 'kysely'
import { db } from '../src/db/Database'
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	kysely: db,
	migrations: {
		migrationFolder: 'src/db/migrations',
	},
	seeds: {
		seedFolder: 'src/db/seeds',
	},
})
