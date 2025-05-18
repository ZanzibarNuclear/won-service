import { PgsodiumDecryptedKey } from './../supaTypes';
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
      .execute()
  }

  async getLatestRatings(limit = 1) {
    const latest = await this.db
      .selectFrom('flux_ratings as fr')
      .innerJoin('users as u', 'u.id', 'fr.moderator_id')
      .select(['fr.id', 'fr.flux_id', 'fr.created_at', 'u.alias as ratedBy'])
      .orderBy('created_at', "desc")
      .limit(limit)
      .execute()
    return latest
  }
}