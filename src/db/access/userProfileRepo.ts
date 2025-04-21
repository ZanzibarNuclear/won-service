import { Kysely } from "kysely"
import { DB } from '../types'
import { ProfileUpdate } from "../../types/won-flux-types"

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

    // NOTE: do not update avatar or glam_shot this way;
    //       use updateAvatar, updateGlamShot instead when new image is uploaded

    return await this.db
      .updateTable('user_profiles')
      .set({
        alias: deltas.alias,
        handle: deltas.handle,
        full_name: deltas.fullName,
        bio: deltas.bio,
        location: deltas.location,
        website: deltas.website,
        why_joined: deltas.whyJoined,
        why_nuclear: deltas.whyNuclear,
        updated_at: new Date()
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
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async clearAvatar(id: string) {
    const avatar = await this.db.selectFrom('user_profiles').select(['avatar']).executeTakeFirst()
    if (avatar) {
      await this.db
        .updateTable('user_profiles')
        .set({
          id,
          avatar: null,
          updated_at: new Date()
        })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
    }
    return avatar
  }

  async updateGlamShot(id: string, glamShot: string) {
    return await this.db
      .updateTable('user_profiles')
      .set({
        id,
        glam_shot: glamShot,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async clearGlamShot(id: string) {
    const glamShot = await this.db.selectFrom('user_profiles').select(['glam_shot']).executeTakeFirst()
    if (glamShot) {
      await this.db
        .updateTable('user_profiles')
        .set({
          id,
          glam_shot: null,
          updated_at: new Date()
        })
        .where('id', '=', id)
        .execute()
    }
    return glamShot
  }
}
