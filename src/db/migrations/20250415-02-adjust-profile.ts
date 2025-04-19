import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable('user_profiles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().references('users.id').onDelete('cascade'))
    .addColumn('alias', 'text')
    .addColumn('handle', 'text')
    .addColumn('full_name', 'text')
    .addColumn('avatar', 'text')
    .addColumn('glam_shot', 'text')
    .addColumn('bio', 'text')
    .addColumn('location', 'text')
    .addColumn('website', 'text')
    .addColumn('why_nuclear', 'text')
    .addColumn('why_joined', 'text')
    .addColumn('karma_score', 'integer', (col) => col.defaultTo(5))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_profiles').execute()
}
