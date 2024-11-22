import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('profiles')
    .dropColumn('username')
    .renameColumn('screen_name', 'alias')
    .renameColumn('created_at', 'joined_at')
    .addColumn('email', 'varchar')
    .addColumn('email_verified_at', 'timestamp')
    .execute()

  await db.schema
    .alterTable('flux_users')
    .renameColumn('created_at', 'joined_at')
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
    .renameColumn('joined_at', 'created_at')
    .execute()

  await db.schema.alterTable('profiles')
    .dropColumn('email_verified_at')
    .dropColumn('email')
    .renameColumn('joined_at', 'created_at')
    .renameColumn('alias', 'screen_name')
    .addColumn('username', 'varchar')
    .execute()
}
