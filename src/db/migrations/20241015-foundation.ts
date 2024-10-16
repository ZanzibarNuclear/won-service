import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('given_name', 'varchar', (col) => col.notNull())
    .addColumn('family_name', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .execute()

  await db.schema
    .createTable('flux_users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').notNull())
    .addColumn('handle', 'varchar', (col) => col.notNull())
    .addColumn('display_name', 'varchar', (col) => col.notNull())
    .addColumn('avatar_url', 'text')
    .addColumn('bio', 'text')
    .addColumn('location', 'text')
    .addColumn('website', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

  await db.schema
    .createTable('fluxes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('flux_user_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('parent_id', 'integer', (col) => col.references('fluxes.id'))
    .addColumn('reply_count', 'integer', (col) => col.defaultTo(0))
    .addColumn('boost_count', 'integer', (col) => col.defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('flux_boosts')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('flux_id', 'integer', (col) => col.references('fluxes.id').notNull())
    .addColumn('flux_user_id', 'integer', (col) => col.references('flux_users.id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('flux_boosts_flux_id_flux_user_id_unique', ['flux_id', 'flux_user_id'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('flux_boosts').execute()
  await db.schema.dropTable('fluxes').execute()
  await db.schema.dropTable('flux_users').execute()
  await db.schema.dropTable('users').execute()
}
