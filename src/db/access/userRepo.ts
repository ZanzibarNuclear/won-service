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

  async getUsers() {
    return []
  }

  async getProfile(userId: string) {
    return await this.db
      .selectFrom('profiles')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst()
  }

  async createProfile(id: string, screenName: string) {
    return await this.db
      .insertInto('profiles')
      .values({
        id,
        screen_name: screenName,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async updateProfile(id: string, screenName: string, fullName: string, avatarUrl: string, bio: string, location: string, joinReason: string, nuclearLikes: string, xUsername: string, website: string) {
    return await this.db
      .updateTable('profiles')
      .set({
        id,
        screen_name: screenName,
        full_name: fullName,
        avatar_url: avatarUrl,
        bio,
        location,
        join_reason: joinReason,
        nuclear_likes: nuclearLikes,
        x_username: xUsername,
        website
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

}
