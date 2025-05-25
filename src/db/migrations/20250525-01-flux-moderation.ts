import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {

  await db.schema
    .alterTable('flux_ratings')
    .addColumn('reviewed_at', 'timestamp')
    .addColumn('reviewed_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('action_taken', 'text')
    .addColumn('review_note', 'text')
    .execute()

  await db.schema
    .alterTable('fluxes')
    .addColumn('blocked_at', 'timestamp')
    .addColumn('rating', 'text')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('fluxes')
    .dropColumn('blocked_at')
    .dropColumn('rating')
    .execute()

  await db.schema
    .alterTable('flux_ratings')
    .dropColumn('reviewed_at')
    .dropColumn('reviewed_by')
    .dropColumn('action_taken')
    .dropColumn('review_note')
    .execute()
}
