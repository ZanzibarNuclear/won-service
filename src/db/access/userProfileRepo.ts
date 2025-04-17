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
      .updateTable('user_profiles')
      .set({
        alias: deltas.alias,
        handle: deltas.handle,
        full_name: deltas.fullName,
        avatar: deltas.avatar,
        glam_shot: deltas.glamShot,
        bio: deltas.bio,
        location: deltas.location,
        website: deltas.website,
        why_joined: deltas.whyJoined,
        why_nuclear: deltas.whyNuclear,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async updateHandle(id: string, handle: string) {
    return await this.db
      .updateTable('user_profiles')
      .set({
        id,
        handle: handle,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async updateAvatar(id: string, avatar: string) {
    return await this.db
      .updateTable('user_profiles')
      .set({
        id,
        avatar: avatar,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async updateGlamShot(id: string, glamShot: string) {
    return await this.db
      .updateTable('user_profiles')
      .set({
        id,
        glam_shot: glamShot,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }
}
