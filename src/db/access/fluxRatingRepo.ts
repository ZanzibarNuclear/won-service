import { Kysely } from "kysely"
import { DB } from '../types'

export class FluxRatingRepository {

  constructor(private db: Kysely<DB>) { }

  async getRatingLevels() {
    return await this.db
      .selectFrom('flux_rating_levels')
      .selectAll()
      .execute()
  }

  async get(ratingId: number) {
    return await this.db
      .selectFrom('flux_ratings')
      .selectAll()
      .where('id', '=', ratingId)
      .executeTakeFirst()
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

  async updateRating(ratingId: number, userId: string, updateData: {
    actionTaken: 'accepted' | 'modified',
    reviewNote?: string,
    rating?: string
  }) {
    return await this.db
      .updateTable('flux_ratings')
      .set({
        action_taken: updateData.actionTaken,
        review_note: updateData.reviewNote,
        rating: updateData.rating || undefined,
        reviewed_at: new Date(),
        reviewed_by: userId
      })
      .where('id', '=', ratingId)
      .returningAll()
      .executeTakeFirst()
  }

  async findRatings(offset: number = 0, limit: number = 10, ratings: string[] = [], latest: boolean = false, needsReview: boolean = false) {
    let query = this.db
      .selectFrom('flux_ratings')
      .selectAll()
      .orderBy('created_at', latest ? 'desc' : 'asc')
      .limit(limit)
      .offset(offset)

    if (ratings && ratings.length > 0) {
      const ratingsArray = Array.isArray(ratings) ? ratings : [ratings]
      query = query.where('rating', 'in', ratingsArray)
    }
    if (needsReview) {
      query = query.where('reviewed_at', 'is', null)
    }
    return await query
      .execute()
  }

  async findUnratedFluxes(offset: number = 0, limit: number = 10) {
    return await this.db
      .selectFrom('fluxes as f')
      .leftJoin('flux_ratings as fr', 'f.id', 'fr.flux_id')
      .where('fr.id', 'is', null)
      .where('f.deleted_at', 'is', null)
      .where('f.blocked_at', 'is', null)
      .select([
        'f.id',
        'f.author_id',
        'f.content',
        'f.posted_at',
        'f.reaction_to',
        'f.boosts',
        'f.reactions',
        'f.views'
      ])
      .orderBy('f.posted_at', 'asc')
      .limit(limit)
      .offset(offset)
      .execute()
  }
}