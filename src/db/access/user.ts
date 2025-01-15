import { db } from "../Database"
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Users } from "../types"

export const getUser = async (userId: string) => {
  return await db.selectFrom('users').selectAll().where('id', '=', userId).executeTakeFirst()
}

export const findOrCreateUser = async (email: string, alias: string) => {
  let user = await db.selectFrom('users')
    .selectAll()
    .where(eb => eb.fn('lower', ['email']), '=', email.toLowerCase())
    .executeTakeFirst()
  if (!user) {
    user = await db
      .insertInto('users')
      .values({
        email,
        alias,
        last_sign_in_at: new Date()
      })
      .returningAll()
      .executeTakeFirst()
  }
  return user
}

