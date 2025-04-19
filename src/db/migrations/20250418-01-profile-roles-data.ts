import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {

  const users = await db.selectFrom('users').select(['id', 'alias']).execute()

  users.forEach(user => {
    db.insertInto('user_profiles')
      .values({
        id: user.id,
        alias: user.alias,
      })
      .execute()

    db.insertInto('user_roles')
      .values({
        user_id: user.id,
        role_id: 'user'
      })
      .execute()

    db.insertInto('user_roles')
      .values({
        user_id: user.id,
        role_id: 'member'
      })
      .execute()
  })
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('user_profiles').execute()
  await db.deleteFrom('user_roles').execute()
}
