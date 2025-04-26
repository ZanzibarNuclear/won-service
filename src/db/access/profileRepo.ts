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

  async isHandleAvailable(handle: string) {
    const result = await this.db.selectFrom('user_profiles')
      .where('handle', '=', handle)
      .select('id')
      .executeTakeFirst()

    const anything = result?.id
    return !anything
  }

  async getNameTags(limit: number = 0, offset: number = 0) {
    let query = this.db
      .selectFrom('user_profiles')
      .select(['alias', 'handle', 'avatar'])
      .where('handle', 'is not', null)
      .orderBy('created_at', 'asc')

    if (limit > 0) {
      query = query.limit(limit)
    }
    if (offset > 0) {
      query = query.offset(offset)
    }

    return await query.execute()
  }
}
