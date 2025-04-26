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
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('flux_followers')
    .addColumn('follower_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('following_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('fluxes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('flux_user_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('parent_id', 'integer', (col) => col.references('fluxes.id').onDelete('set null'))
    .addColumn('reactions', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('boosts', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('views', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('flux_boosts')
    .addColumn('flux_id', 'integer', (col) => col.references('fluxes.id').notNull())
    .addColumn('flux_user_id', 'integer', (col) =>
      col.references('flux_users.id').onDelete('cascade').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('flux_boosts_pkey', ['flux_id', 'flux_user_id'])
    .execute()

  await db.schema
    .createTable('flux_views')
    .addColumn('flux_id', 'integer', (col) => col.references('fluxes.id').notNull())
    .addColumn('flux_user_id', 'integer')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // await db.schema.alterTable('z_v1_flux_users').renameTo('flux_users').execute()
  // await db.schema.alterTable('z_v1_flux_followers').renameTo('flux_followers').execute()
  // await db.schema.alterTable('z_v1_fluxes').renameTo('fluxes').execute()
  // await db.schema.alterTable('z_v1_flux_boosts').renameTo('flux_boosts').execute()
  // await db.schema.alterTable('z_v1_flux_views').renameTo('flux_views').execute()
}
