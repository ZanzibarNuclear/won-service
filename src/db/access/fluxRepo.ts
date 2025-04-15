import { Kysely } from "kysely"
import { DB } from '../types'
import { jsonObjectFrom } from "kysely/helpers/postgres"
import type { FluxFilter } from "../../types/won-flux-types"

export class FluxRepository {
  selectFluxQuery: any

  constructor(private db: Kysely<DB>) {
    this.selectFluxQuery = this.db
      .selectFrom('fluxes')
      .selectAll()
      .select((eb) => [
        jsonObjectFrom(
          eb.selectFrom('flux_users as author')
            .select(['author.id', 'author.handle', 'author.display_name'])
            .whereRef('author.id', '=', 'fluxes.flux_user_id')
        ).as('author')
      ])
  }

  // queries
  async getFlux(fluxId: number) {
    return await this.selectFluxQuery
      .where('id', '=', fluxId)
      .executeTakeFirst()
  }

  async getFluxes(limit: number, offset: number, filter: FluxFilter) {
    let enhancedQuery = this.selectFluxQuery
    if (filter.authorId) {
      enhancedQuery = enhancedQuery.where('flux_user_id', '=', filter.authorId)
    }
    if (filter.fluxId) {
      enhancedQuery = enhancedQuery.where('parent_id', '=', filter.fluxId)
    }
    if (filter.order) {
      // TODO: probably not good to have a hidden magic words
      if (filter.order === 'trending') {
        enhancedQuery = enhancedQuery.orderBy('boost_count', 'desc')
      }
    } else {
      enhancedQuery = enhancedQuery.orderBy('fluxes.created_at', 'desc')
    }
    return await enhancedQuery
      .limit(limit)
      .offset(offset)
      .execute()
  }

  // mutations
  async createFlux(fluxUserId: number, parentId: number | null, content: string) {
    let freshFlux = await this.db
      .insertInto('fluxes')
      .values({
        flux_user_id: fluxUserId,
        parent_id: parentId,
        content: content,
      })
      .returningAll()
      .executeTakeFirst()
    if (freshFlux && parentId) {
      await this.recountReactions(parentId)
    }
    return freshFlux
  }

  async recountReactions(fluxId: number) {
    const reactionCount = await this.db
      .selectFrom('fluxes')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('parent_id', '=', fluxId)
      .executeTakeFirst()
    await this.db
      .updateTable('fluxes')
      .set({ reply_count: Number(reactionCount?.count) })
      .where('id', '=', fluxId)
      .executeTakeFirst()
  }

  async updateFlux(fluxId: number, content: string, authorId: number) {
    return await this.db
      .updateTable('fluxes')
      .set({ content })
      .where('id', '=', fluxId)
      .where('flux_user_id', '=', authorId)
      .returningAll()
      .executeTakeFirst()
  }

  async recountFluxBoosts(fluxId: number) {
    const boostCount = await this.db
      .selectFrom('flux_boosts')
      .select((eb) => eb.fn.count('flux_id').as('count'))
      .where('flux_id', '=', fluxId)
      .executeTakeFirst()

    // TODO: is there a way to use subquery
    return await this.db
      .updateTable('fluxes')
      .set({ boost_count: Number(boostCount?.count) })
      .where('id', '=', fluxId)
      .returningAll()
      .executeTakeFirst()
  }

  async boostFlux(fluxId: number, fluxUserId: number) {
    await this.db
      .insertInto('flux_boosts')
      .values({ flux_id: fluxId, flux_user_id: fluxUserId })
      .executeTakeFirst()

    return await this.recountFluxBoosts(fluxId)
  }

  async deboostFlux(fluxId: number, fluxUserId: number) {
    await this.db
      .deleteFrom('flux_boosts')
      .where('flux_id', '=', fluxId)
      .where('flux_user_id', '=', fluxUserId)
      .executeTakeFirst()

    return await this.recountFluxBoosts(fluxId)
  }

  async retallyFluxViews(fluxId: number) {
    const viewCount = await this.db
      .selectFrom('flux_views')
      .select((eb) => eb.fn.count('flux_id').as('count'))
      .where('flux_id', '=', fluxId)
      .executeTakeFirst()

    // TODO: is there a way to use subquery
    return await this.db
      .updateTable('fluxes')
      .set({ view_count: Number(viewCount?.count) })
      .where('id', '=', fluxId)
      .returningAll()
      .executeTakeFirst()
  }

  /**
   * Count a view for a flux by a user.
   * @param fluxId - The ID of the flux.
   * @param fluxUserId - The ID of the user viewing the flux. Use -1 for anonymous views.
   * @returns The updated flux.
   */
  async countView(fluxId: number, fluxUserId: number) {
    await this.db
      .insertInto('flux_views')
      .values({ flux_id: fluxId, flux_user_id: fluxUserId })
      .execute()

    return await this.retallyFluxViews(fluxId)
  }

  // subscriptions

  // identity
  async getFluxUser(userId: string) {
    return await this.db
      .selectFrom('flux_users')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst()
  }

  async createFluxUser(userId: string, handle: string, displayName: string) {
    return await this.db
      .insertInto('flux_users')
      .values({
        user_id: userId,
        handle: handle,
        display_name: displayName
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  }
}