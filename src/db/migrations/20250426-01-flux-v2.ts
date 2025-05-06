import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // switch table dependency from flux_users to users
  await db.schema.alterTable('karma_awards').dropColumn('flux_user_id').execute()
  await db.schema.alterTable('karma_awards')
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade')).execute()

  await db.schema.dropTable('flux_views').ifExists().execute()
  await db.schema.dropTable('flux_boosts').ifExists().execute()
  await db.schema.dropTable('fluxes').ifExists().execute()
  await db.schema.dropTable('flux_followers').ifExists().execute()
  await db.schema.dropTable('flux_users').ifExists().execute()

  await db.schema
    .createTable('flux_users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').unique().notNull())
    .addColumn('following', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('followers', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('flux_followers')
    .addColumn('follower_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('following_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('followed_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('fluxes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('author_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('reaction_to', 'integer', (col) => col.references('fluxes.id').onDelete('set null'))
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('reactions', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('boosts', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('views', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('posted_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('flux_boosts')
    .addColumn('flux_id', 'integer', (col) => col.references('fluxes.id').notNull())
    .addColumn('flux_user_id', 'integer', (col) =>
      col.references('flux_users.id').onDelete('cascade').notNull())
    .addColumn('boosted_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('flux_boosts_pkey', ['flux_id', 'flux_user_id'])
    .execute()

  await db.schema
    .createTable('flux_views')
    .addColumn('flux_id', 'integer', (col) => col.references('fluxes.id').notNull())
    .addColumn('flux_user_id', 'integer')
    .addColumn('viewed_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('karma_awards').dropColumn('user_id').execute()
  await db.schema.alterTable('karma_awards').addColumn('flux_user_id', 'integer').execute()
}
