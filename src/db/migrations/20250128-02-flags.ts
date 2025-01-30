import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('objection_reasons')
    .addColumn('code', 'text', col => col.primaryKey())
    .addColumn('description', 'text', col => col.notNull())
    .execute()

  await db
    .insertInto('objection_reasons')
    .values([
      { code: 'terms', description: 'Seems to violate terms of use' },
      { code: 'copyright', description: 'Infringes on copyright protections' },
      { code: 'vulgar', description: 'Excessive use of curse words or graphic imagery' },
      { code: 'personal', description: 'Resorts to personal attacks' },
      { code: 'illegal', description: 'Illegal materials' },
      { code: 'other', description: 'Something else (please explain)' },
    ])
    .execute()

  await db.schema
    .createTable('violation_reports')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('reported_by', 'uuid', col => col.references('users.id').notNull())
    .addColumn('app_key', 'text', col => col.notNull())
    .addColumn('content_key', 'text', col => col.notNull())
    .addColumn('reasons', sql`text[]`, col => col.notNull())
    .addColumn('message', 'text')
    .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('violation_reports').ifExists().execute()
  await db.schema.dropTable('objection_reasons').ifExists().execute()
}
