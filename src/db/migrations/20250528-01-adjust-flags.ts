import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('violation_reports')
    .addColumn('handled_at', 'timestamptz')
    .addColumn('handled_by', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('resolution_note', 'text')
    .execute()

  await db.schema
    .alterTable('objection_reasons')
    .addColumn('sort', 'integer')
    .execute()

  const sortValues = [
    { code: 'terms', sort: 1 },
    { code: 'copyright', sort: 2 },
    { code: 'illegal', sort: 3 },
    { code: 'personal', sort: 4 },
    { code: 'vulgar', sort: 5 },
    { code: 'other', sort: 100 },
  ]
  sortValues.forEach(async item => {
    await db.updateTable('objection_reasons')
      .set('sort', item.sort)
      .where('code', '=', item.code)
      .execute()
  })
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('objection_reasons').dropColumn('sort').execute()
  await db.schema
    .alterTable('violation_reports')
    .dropColumn('handled_at')
    .dropColumn('handled_by')
    .dropColumn('resolution_note')
    .execute()
}
