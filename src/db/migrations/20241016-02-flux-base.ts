import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('flux_users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').unique().notNull())
    .addColumn('handle', 'varchar', (col) => col.notNull())
    .addColumn('display_name', 'varchar', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createTable('fluxes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('flux_user_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('parent_id', 'integer', (col) => col.references('fluxes.id').onDelete('set null'))
    .addColumn('reply_count', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('boost_count', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .addColumn('blargy', 'text')
    .execute()

  await db.schema
    .createTable('flux_boosts')
    .addColumn('flux_id', 'integer', (col) => col.references('fluxes.id').notNull())
    .addColumn('flux_user_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('flux_boosts_pkey', ['flux_id', 'flux_user_id'])
    .execute()

}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('flux_boosts').ifExists().execute()
  await db.schema.dropTable('fluxes').ifExists().execute()
  await db.schema.dropTable('flux_users').ifExists().execute()
}
