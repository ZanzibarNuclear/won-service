import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('flux_views')
    .addColumn('flux_id', 'integer', (col) => col.references('fluxes.id').notNull())
    .addColumn('flux_user_id', 'integer')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema.alterTable('fluxes')
    .addColumn('view_count', 'integer', (col) => col.defaultTo(0).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('flux_views').ifExists().execute()
  await db.schema.alterTable('fluxes')
    .dropColumn('view_count')
    .execute()
}
