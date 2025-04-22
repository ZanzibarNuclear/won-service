import { Kysely } from "kysely"
import { DB } from '../types'

export class PublicProfileRepository {
  constructor(private db: Kysely<DB>) { }

  async findByHandle(handle: string) {
    return await this.db
      .selectFrom('user_profiles')
      .select([
        'alias',
        'avatar',
        'bio',
        'created_at',
        'glam_shot',
        'handle',
        'karma_score',
        'location',
        'website',
        'why_joined',
        'why_nuclear'
      ])
      .where('handle', '=', handle)
      .executeTakeFirst()
  }
}
