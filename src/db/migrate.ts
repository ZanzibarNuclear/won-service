import { promises as fs } from 'fs'
import path from 'path'
import { Migrator, FileMigrationProvider } from 'kysely'
import { db } from './Database'

async function getMigrator() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  })
  return { db, migrator }
}

async function migrateToLatest() {
  const { db, migrator } = await getMigrator()
  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

async function migrateUp() {
  const { db, migrator } = await getMigrator()
  const { error, results } = await migrator.migrateUp()

  if (results && results.length > 0) {
    console.log(`migration "${results[0].migrationName}" was executed successfully`)
  } else {
    console.log('No migrations to run')
  }

  if (error) {
    console.error('failed to migrate up')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

async function migrateDown() {
  const { db, migrator } = await getMigrator()
  const { error, results } = await migrator.migrateDown()

  if (results && results.length > 0) {
    console.log(`migration "${results[0].migrationName}" was reverted successfully`)
  } else {
    console.log('No migrations to revert')
  }

  if (error) {
    console.error('failed to migrate down')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

// Parse command line arguments
const command = process.argv[2]

switch (command) {
  case 'latest':
    migrateToLatest()
    break
  case 'up':
    migrateUp()
    break
  case 'down':
    migrateDown()
    break
  default:
    console.log('Usage: ts-node migrate.ts [latest|up|down]')
    process.exit(1)
}
