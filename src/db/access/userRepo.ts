import { Kysely } from "kysely"
import { DB } from '../types'

export class UserRepository {
  constructor(private db: Kysely<DB>) { }

  async findUserByEmail(email: string) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where(eb => eb.fn('lower', ['email']), '=', email.toLowerCase())
      .executeTakeFirst()
  }

  async signInUser(email: string) {
    const user = await this.findUserByEmail(email)
    if (!user) {
      return null
    }
    return await this.db
      .updateTable('users')
      .set({
        last_sign_in_at: new Date()
      })
      .where('id', '=', user.id)
      .returningAll()
      .executeTakeFirst()
  }

  async createUser(email: string, alias: string) {
    return await this.db
      .insertInto('users')
      .values({
        email: email,
        alias: alias,
        last_sign_in_at: new Date()
      })
      .returningAll()
      .executeTakeFirst()
  }

  async getUser(id: string) {
    return await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }

  async getUsers(limit: number, offset: number) {
    return await this.db.selectFrom('users')
      .selectAll()
      .limit(10)
      .execute()
  }
}
