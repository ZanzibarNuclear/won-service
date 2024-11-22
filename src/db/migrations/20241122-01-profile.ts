import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('profiles')
    .dropColumn('username')
    .addColumn('email', 'varchar')
    .addColumn('email_verified_at', 'timestamp')
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
