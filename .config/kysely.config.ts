import {
	DummyDriver,
	PostgresAdapter,
	PostgresIntrospector,
	PostgresQueryCompiler,
} from 'kysely'
import { db } from '~/db/Database'
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	kysely: db,
	migrations: {
		migrationFolder: 'db/migrations',
	},
	plugins: [],
	seeds: {
		seedFolder: 'db/seeds',
	},
})
