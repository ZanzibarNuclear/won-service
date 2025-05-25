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
    .execute()

  await db.schema
    .alterTable('flux_rating_levels')
    .addColumn('display', 'text')
    .execute()

  await db
    .updateTable('flux_rating_levels')
    .set({
      display: '-',
      description: '* Unrated'
    })
    .where('code', '=', 'unrated')
    .execute()
  await db
    .updateTable('flux_rating_levels')
    .set({ display: 'G' })
    .where('code', '=', 'safe')
    .execute()
  await db
    .updateTable('flux_rating_levels')
    .set({
      display: 'PG',
      description: '* Aggressive language that is not a direct attack on others;\n* Possible sexual innuendo'
    })
    .where('code', '=', 'edgy')
    .execute()
  await db
    .updateTable('flux_rating_levels')
    .set({
      display: 'R',
      description: '* Contains any of the following curse words: "ass", "asshole", "hell", "damn", "bitch", "bastard"\n* Attacking others, name-calling\n* Sexually explicit'
    })
    .where('code', '=', 'harsh')
    .execute()
  await db
    .updateTable('flux_rating_levels')
    .set({
      display: 'MA',
      description: '* Contains any of the forbidden words.\n* Threats of violence\n* Graphic sexuality\n* Illegal information'
    })
    .where('code', '=', 'violation')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('flux_rating_levels')
    .dropColumn('display')
    .execute()

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
