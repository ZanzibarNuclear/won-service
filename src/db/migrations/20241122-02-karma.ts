import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('profiles')
    .addColumn('karma_score', 'integer', (col) => col.defaultTo(5).notNull())
    .execute()

  await db.schema
    .createTable('achievements')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('karma_value', 'integer', (col) => col.defaultTo(1).notNull())
    .execute()

  await db.schema
    .createTable('karma_awards')
    .addColumn('flux_user_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('achievement_id', 'integer', (col) => col.references('achievements.id'))
    .addColumn('karma_awarded', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db
    .insertInto('achievements')
    .values([
      {
        name: 'First Flux',
        description: 'Created your first flux',
        karma_value: 10,
      },
      {
        name: 'First Boost',
        description: 'Boosted a flux for the first time',
        karma_value: 10,
      },
      {
        name: '100 Fluxes',
        description: 'Created 100 fluxes',
        karma_value: 50,
      },
      {
        name: 'Chain Reaction',
        description: 'Received 20 reactions on a single flux',
        karma_value: 50,
      },
      {
        name: 'Influencer',
        description: 'Reached 1000 followers',
        karma_value: 10000,
      },
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('karma_awards').ifExists().execute()

  await db.schema.dropTable('achievements').ifExists().execute()

  await db.schema
    .alterTable('profiles')
    .dropColumn('karma_score')
    .execute()
}
