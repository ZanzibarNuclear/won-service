import { db } from "../Database"

// queries
export interface EventFilter {
  from?: string
  to?: string
  asc?: boolean
  actor?: string
}

export const getEvents = async (limit: number = 0, offset: number = 0, filter: EventFilter) => {

  const { from, to, asc, actor } = filter
  let query = db.selectFrom('events').selectAll()

  if (actor) {
    query = query.where('actor_id', '=', actor)
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
export const createEvent = async (actorId: string | undefined, details: string) => {
  let event = await db
    .insertInto('events')
    .values({
      actor_id: actorId,
      details: details
    })
    .returningAll()
    .execute()

  return event
}

