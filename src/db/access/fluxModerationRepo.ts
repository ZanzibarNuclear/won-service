import { Kysely } from "kysely"
import { DB } from '../types'

export class FluxModerationRepository {

  constructor(private db: Kysely<DB>) { }

  async getRatingLevels() {
    return await this.db
      .selectFrom('flux_rating_levels')
      .selectAll()
      .execute()
  }

  async rateFlux(moderatorId: string, fluxId: number, rating: string, reason: string) {
    return await this.db
      .insertInto('flux_ratings')
      .values({
        moderator_id: moderatorId,
        flux_id: fluxId,
        rating,
        reason
      })
      .returningAll()
      .executeTakeFirst()
  }

  async get(offset: number = 0, limit: number = 10) {
    return await this.db
      .selectFrom('flux_ratings')
      .selectAll()
      .orderBy('created_at', 'asc')
      .limit(limit)
      .offset(offset)
      .execute()
  }

  async getLatestRatings(limit = 1) {
    // FIXME: change this to find the latest post that was rated -- or better, find posts without ratings, starting with the oldest
    const latest = await this.db
      .selectFrom('flux_ratings as fr')
      .innerJoin('users as u', 'u.id', 'fr.moderator_id')
      .innerJoin('fluxes as flux', 'flux.id', 'fr.flux_id')
      .select(['fr.id', 'fr.flux_id', 'fr.created_at', 'u.alias as ratedBy', 'flux.posted_at'])
      .orderBy('created_at', "desc")
      .limit(limit)
      .execute()
    return latest
  }

  async findRatings(offset: number = 0, limit: number = 10, ratings: string[] = [], latest: boolean = false) {
    let query = this.db
      .selectFrom('flux_ratings as fr')
      .innerJoin('fluxes as f', 'f.id', 'fr.flux_id')
      .select(['fr.id', 'fr.rating', 'fr.reason', 'fr.flux_id', 'f.author_id', 'f.content'])
      .orderBy('created_at', latest ? 'desc' : 'asc')
      .limit(limit)
      .offset(offset)

    if (ratings) {
      const ratingsArray = Array.isArray(ratings) ? ratings : [ratings]
      query = query.where('fr.rating', 'in', ratingsArray)
    }

    return await query
      .execute()
  }
}