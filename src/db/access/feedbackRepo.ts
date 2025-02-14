import { Kysely } from "kysely"
import { DB } from '../types'
import { JsonValue } from "../types"

// queries
export interface FeedbackFilter {
  from?: string
  to?: string
  asc?: boolean
  user?: string
}

export class FeedbackRepository {
  constructor(private db: Kysely<DB>) { }

  async get(limit: number = 0, offset: number = 0, filter: FeedbackFilter) {

    const { from, to, asc, user } = filter
    let query = this.db
      .selectFrom('feedback_messages')
      .selectAll()

    if (user) {
      query = query.where('user_id', '=', user)
    }
    if (from) {
      const ts = new Date(from)
      query = query.where('created_at', '>=', ts)
    }
    if (to) {
      const ts = new Date(to)
      query = query.where('created_at', '<', ts)
    }
    if (limit > 0) {
      query = query.limit(limit).offset(offset)
    }
    query = query.orderBy('created_at', asc ? 'asc' : 'desc')

    return await query.execute()
  }

  // mutations
  async register(user_id: string | undefined, context: JsonValue, message: string) {

    return await this.db
      .insertInto('feedback_messages')
      .values({
        user_id, context, message
      })
      .returningAll()
      .executeTakeFirst()
  }

}