import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('inspirations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('title', 'text')
    .addColumn('content', 'text')
    .addColumn('media_url', 'text')
    .addColumn('weight', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('created_by', 'text')
    .execute()

  // Add index for efficient random selection with weights
  await db.schema
    .createIndex('inspirations_active_weight_idx')
    .on('inspirations')
    .columns(['active', 'weight'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('inspirations').execute()
} 