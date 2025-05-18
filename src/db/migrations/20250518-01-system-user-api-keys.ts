import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('api_keys')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').notNull())
    .addColumn('key_hash', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('last_used_at', 'timestamp')
    .addColumn('expires_at', 'timestamp')
    .addColumn('revoked_at', 'timestamp')
    .execute()

  // Add index for faster lookups
  await db.schema
    .createIndex('api_keys_user_id_idx')
    .on('api_keys')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('api_keys_user_id_idx').execute()
  await db.schema.dropTable('api_keys').execute()
}