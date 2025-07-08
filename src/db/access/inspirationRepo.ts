import { Kysely, sql } from "kysely"
import { DB } from '../types'

export interface InspirationFilter {
  active?: boolean
  limit?: number
  offset?: number
}

export interface InspirationCreate {
  title?: string
  content?: string
  media_url?: string
  weight?: number
  active?: boolean
  created_by?: string
}

export interface InspirationUpdate {
  title?: string
  content?: string
  media_url?: string
  weight?: number
  active?: boolean
}

export class InspirationRepository {
  constructor(private db: Kysely<DB>) { }

  async getAll(filter: InspirationFilter = {}) {
    const { active, limit, offset } = filter
    let query = this.db
      .selectFrom('inspirations')
      .selectAll()

    if (active !== undefined) {
      query = query.where('active', '=', active)
    }
    if (limit && limit > 0) {
      query = query.limit(limit).offset(offset || 0)
    }
    query = query.orderBy('created_at', 'desc')

    return await query.execute()
  }

  async getById(id: number) {
    return await this.db
      .selectFrom('inspirations')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
  }

  async getRandomActive() {
    // Use weighted random selection based on the weight column
    // This uses a technique where we order by random() * weight
    return await this.db
      .selectFrom('inspirations')
      .selectAll()
      .where('active', '=', true)
      .orderBy(sql`random() * weight`, 'desc')
      .limit(1)
      .executeTakeFirst()
  }

  async create(inspiration: InspirationCreate) {
    return await this.db
      .insertInto('inspirations')
      .values({
        title: inspiration.title || null,
        content: inspiration.content || null,
        media_url: inspiration.media_url || null,
        weight: inspiration.weight || 1,
        active: inspiration.active !== false, // default to true
        created_by: inspiration.created_by || null,
        updated_at: new Date()
      })
      .returningAll()
      .executeTakeFirst()
  }

  async update(id: number, inspiration: InspirationUpdate) {
    return await this.db
      .updateTable('inspirations')
      .set({
        ...inspiration,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async delete(id: number) {
    return await this.db
      .deleteFrom('inspirations')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async toggleActive(id: number) {
    const current = await this.getById(id)
    if (!current) {
      throw new Error('Inspiration not found')
    }

    return await this.update(id, { active: !current.active })
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.db
        .selectFrom('inspirations')
        .select(({ fn }) => [fn.count<number>('id').as('count')])
        .executeTakeFirst(),

      this.db
        .selectFrom('inspirations')
        .select(({ fn }) => [fn.count<number>('id').as('count')])
        .where('active', '=', true)
        .executeTakeFirst()
    ])

    return {
      total: total?.count || 0,
      active: active?.count || 0
    }
  }
} 