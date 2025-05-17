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

  async rateFlux(moderatorId: string, fluxId: number, ratingCode: string, reason: string) {
    return await this.db
      .insertInto('flux_ratings')
      .values({
        moderator_id: moderatorId,
        flux_id: fluxId,
        rating: ratingCode,
        reason: reason
      })
      .returningAll()
      .executeTakeFirst()
  }

  async latestFluxRatings(limit = 1) {
    const latest = await this.db
      .selectFrom('flux_ratings')
      .orderBy('created_at', "desc")
      .limit(limit)
      .select(['id', 'flux_id', 'created_at'])
      .execute()
    return latest
  }
}