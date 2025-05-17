import { Kysely, sql } from 'kysely'

const robotEmail = 'robo1@nuclearambitions.com'

export async function up(db: Kysely<any>): Promise<void> {


  await db.schema
    .createTable('flux_rating_levels')
    .addColumn('code', 'text', (col) => col.primaryKey())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('severity', 'integer')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('retired', 'timestamp')
    .execute()

  await db
    .insertInto('flux_rating_levels')
    .values([
      {
        code: 'unrated',
        description: '* Ambiguous\n* Uncertain about whether there is cause for alarm',
        severity: 0,
      },
      {
        code: 'safe',
        description: '* Safe for all ages',
        severity: 1,
      },
      {
        code: 'edgy',
        description: '* Aggressive language that is not a direct attack on others;\n* Possible sexual innuendo',
        severity: 2,
      },
      {
        code: 'harsh',
        description: '* Contains any of the following curse words: "ass", "asshole", "hell", "damn", "bitch", "bastard"\n* Attacking others, name- calling\n* Sexually explicit\n* Illegal topics',
        severity: 3,
      },
      {
        code: 'violation',
        description: '* Contains any of the following curse words: "fuck", "shit", "cunt", "motherfucker"\n* Threats of violence\n* Graphic sexuality',
        severity: 4,
      },
    ])
    .execute()

  await db.schema
    .createTable('flux_ratings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('moderator_id', 'uuid', (col) => col.references('users.id').unique().notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('flux_id', 'serial', (col) => col.references('fluxes.id').notNull())
    .addColumn('rating', 'text', (col) => col.defaultTo('unrated').notNull())
    .addColumn('reason', 'text')
    .execute()

  await db.schema.alterTable('users')
    .addColumn('system_bot', "boolean", (col) => col.defaultTo(false))
    .execute()

  await db.schema.alterTable('users')
    .addUniqueConstraint('users_alias_unique', ['alias'])
    .execute()

  const agent = await db
    .insertInto('users')
    .values({
      email: robotEmail,
      alias: 'robotNanny',
      system_bot: true,
      last_sign_in_at: new Date()
    })
    .returning(['id'])
    .executeTakeFirst()

  if (agent) {
    await db.insertInto('user_roles').values({ user_id: agent.id, role_id: 'moderator' }).execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('users')
    .where('email', '=', robotEmail)
    .execute()

  await db.schema
    .alterTable('users')
    .dropConstraint('users_alias_unique')
    .execute()

  await db.schema
    .alterTable('users')
    .dropColumn('system_bot')
    .execute()

  await db.schema.dropTable('flux_ratings').execute()
  await db.schema.dropTable('flux_rating_levels').execute()
}
