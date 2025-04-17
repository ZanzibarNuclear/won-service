import { Kysely } from "kysely"
import { DB } from '../types'
import { ProfileUpdate } from "../../types/won-flux-types"

// FIXME: rewrite using new user_profiles table

export class UserProfileRepository {
  constructor(private db: Kysely<DB>) { }

  async get(userId: string) {
    return await this.db
      .selectFrom('user_profiles')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst()
  }

  async create(id: string, alias: string) {
    return await this.db
      .insertInto('user_profiles')
      .values({
        id,
        alias,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async update(id: string, deltas: ProfileUpdate) {
    return await this.db
      .updateTable('profiles')
      .set({
        screen_name: deltas.screenName,
        full_name: deltas.fullName,
        avatar_url: deltas.avatarUrl,
        bio: deltas.bio,
        location: deltas.location,
        join_reason: deltas.joinReason,
        nuclear_likes: deltas.nuclearLikes,
        x_username: deltas.xUsername,
        website: deltas.website
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return await this.db
      .updateTable('profiles')
      .set({
        id,
        avatar_url: avatarUrl,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }
}
