import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('profiles').ifExists().execute()

  await db.schema
    .createTable('profiles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().references('users.id').onDelete('cascade'))
    .addColumn('screen_name', 'varchar')
    .addColumn('avatar_url', 'text')
    .addColumn('bio', 'text')
    .addColumn('location', 'text')
    .addColumn('website', 'text')
    .addColumn('nuclear_likes', 'text')
    .addColumn('join_reason', 'text')
    .addColumn('x_username', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema.alterTable('users')
    .addColumn('email_verified_at', 'timestamp')
    .execute()

  await db.schema.alterTable('flux_users')
    .addUniqueConstraint('flux_users_handle_unique', ['handle'])
    .execute()

  await db.schema
    .alterTable('flux_users')
    .addColumn('email_notifications', 'timestamp')
    .addColumn('text_notifications', 'timestamp')
    .addColumn('digest_frequency', 'varchar')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('flux_users')
    .dropColumn('digest_frequency')
    .dropColumn('text_notifications')
    .dropColumn('email_notifications')
    .execute()

  await db.schema.alterTable('profiles')
    .dropColumn('email_verified_at')
    .dropColumn('email')
    .addColumn('username', 'varchar')
    .execute()
}
