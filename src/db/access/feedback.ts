import { db } from "../Database"
import { JsonValue } from "../types"

// queries
export interface EventFilter {
  from?: string
  to?: string
  asc?: boolean
  user?: string
}

export const getFeedback = async (limit: number = 0, offset: number = 0, filter: EventFilter) => {

  const { from, to, asc, user } = filter
  let query = db.selectFrom('feedback_messages').selectAll()

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
export const registerFeedback = async (user_id: string | undefined, context: JsonValue, message: string) => {
  let event = await db
    .insertInto('feedback_messages')
    .values({
      user_id, context, message
    })
    .returningAll()
    .execute()

  return event
}

