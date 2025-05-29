import { Kysely } from "kysely"
import { DB } from '../types'

export interface FlagFilter {
  from?: string
  to?: string
  desc?: boolean
  reporter?: string
  unresolved?: boolean
}

interface CreateFlagRequest {
  reported_by: string
  app_key: string
  content_key: string
  reasons: string[]
  message?: string
}

export class FlagRepository {
  constructor(private db: Kysely<DB>) { }

  // queries
  async get(limit: number = 0, offset: number = 0, filter: FlagFilter) {

    const { from, to, desc, reporter, unresolved } = filter
    let query = this.db
      .selectFrom('violation_reports')
      .selectAll()

    if (reporter) {
      query = query.where('reported_by', '=', reporter)
    }
    if (from) {
      const ts = new Date(from)
      query = query.where('created_at', '>=', ts)
    }
    if (to) {
      const ts = new Date(to)
      query = query.where('created_at', '<', ts)
    }
    if (unresolved) {
      query.where('handled_at', 'is', null)
    }
    if (limit > 0) {
      query = query.limit(limit).offset(offset)
    }
    query = query.orderBy('created_at', desc ? 'desc' : 'asc')

    return await query.execute()
  }

  // mutations

  async create(reported_by: string, app_key: string, content_key: string, reasons: string[], message?: string) {
    let values: CreateFlagRequest = {
      reported_by,
      app_key,
      content_key,
      reasons,
      message
    }
    console.log('recording event: %o', values)
    return await this.db
      .insertInto('violation_reports')
      .values(values)
      .returningAll()
      .executeTakeFirst()
  }

  async flagFluxPost(reportedBy: string, fluxId: number, reasons: string[], message?: string) {
    return await this.create(reportedBy, 'flux', fluxId.toString(), reasons, message)
  }

  async flagProfile(reportedBy: string, userId: string, reasons: string[], message?: string) {
    return await this.create(reportedBy, 'profile', userId, reasons, message)
  }

  async flagBlogPost(reportedBy: string, userId: string, reasons: string[], message?: string) {
    return await this.create(reportedBy, 'profile', userId, reasons, message)
  }

  async resolve(flagId: number, userId: string, resolutionNote: string) {
    return await this.db
      .updateTable('violation_reports')
      .set({
        handled_at: new Date(),
        handled_by: userId,
        resolution_note: resolutionNote
      })
      .where('id', '=', flagId)
      .execute()
  }

  async getObjectionReasons() {
    return await this.db
      .selectFrom('objection_reasons')
      .selectAll()
      .orderBy('sort')
      .execute()
  }
}