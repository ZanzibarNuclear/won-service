import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('identities')
    .dropConstraint('identities_email_key')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('identities')
    .dropColumn('email')
    .execute()

  await db.schema
    .alterTable('identities')
    .renameColumn('email_old', 'email')
    .execute()
}
