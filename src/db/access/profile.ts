import { db } from "../Database"
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Users } from "../types"

export const getUserProfile = async (userId: string) => {
  return await db.selectFrom('profiles').selectAll().where('id', '=', userId).executeTakeFirst()
}

export const createUserProfile = async (id: string, screenName: string, email: string) => {
  let user = await db.selectFrom('users')
    .selectAll()
    .where(eb => eb.fn('lower', ['email']), '=', email.toLowerCase())
    .executeTakeFirst()
  if (!user) {
    // user = await db
    //   .insertInto('users')
    //   .values({
    //     id,
    //     alias,
    //     last_sign_in_at: new Date()
    //   })
    //   .returningAll()
    //   .executeTakeFirst()
  }
  return user
}

