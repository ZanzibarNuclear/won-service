import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('flux_followers')
    .addColumn('follower_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('following_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('flux_followers').ifExists().execute()
}
