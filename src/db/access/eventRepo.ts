import { Kysely } from "kysely"
import { DB } from '../types'

export interface EventFilter {
  from?: string
  to?: string
  asc?: boolean
  actor?: string
}

interface CreateEventRequest {
  actor_id?: string;
  details: any;
}

export class EventRepository {
  constructor(private db: Kysely<DB>) { }

  // queries
  async get(limit: number = 0, offset: number = 0, filter: EventFilter) {

    const { from, to, asc, actor } = filter
    let query = this.db
      .selectFrom('events')
      .selectAll()

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

  async create(actorId: string | null, details: any) {
    const values: CreateEventRequest = {
      details
    }
    if (actorId) {
      values['actor_id'] = actorId
    }
    console.log('recording event: ' + JSON.stringify(values))
    return await this.db
      .insertInto('events')
      .values(values)
      .returningAll()
      .executeTakeFirst()
  }

}