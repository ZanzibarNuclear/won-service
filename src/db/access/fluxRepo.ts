import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { Kysely, sql } from "kysely"
import { DB } from '../types'
import type { FluxFilter } from "../../types/won-flux-types"

export class FluxRepository {
  selectFluxQuery: any
  selectFluxUserQuery: any

  // TODO: use env var instead of hardcoding '/media/members/' (available via fastify)
  // OR come up with a better strategy for locating / storing CDN file paths

  constructor(private db: Kysely<DB>) {
    this.selectFluxQuery = this.db
      .selectFrom('fluxes')
      .where('deleted_at', 'is', null)
      .select((eb) => [
        jsonObjectFrom(
          eb.selectFrom('flux_users as author')
            .innerJoin('user_profiles as up', 'up.id', 'author.user_id')
            .select([
              'author.id',
              'up.handle',
              'up.alias',
              sql<string>`concat('/media/members/', up.avatar)`.as('avatar'),
            ])
            .whereRef('author.id', '=', 'fluxes.author_id')
        ).as('author')
      ])
      .selectAll()
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
      enhancedQuery = enhancedQuery.where('author_id', '=', filter.authorId)
    }
    if (filter.fluxId) {
      enhancedQuery = enhancedQuery.where('reaction_to', '=', filter.fluxId)
    }
    if (filter.order) {
      // TODO: probably not good to have a hidden magic words
      if (filter.order === 'trending') {
        enhancedQuery = enhancedQuery.orderBy('boost_count', 'desc')
      }
    } else {
      enhancedQuery = enhancedQuery.orderBy('fluxes.posted_at', 'desc')
    }
    return await enhancedQuery
      .limit(limit)
      .offset(offset)
      .execute()
  }

  // mutations
  // FIXME: these need to return full flux using getFlux method - or just an ID and let the handler decide what to return to the client
  async createFlux(authorId: number, reactionTo: number | null, content: string) {
    let freshFlux = await this.db
      .insertInto('fluxes')
      .values({
        author_id: authorId,
        reaction_to: reactionTo,
        content: content,
      })
      .returning('id')
      .executeTakeFirst()

    const freshId = freshFlux?.id
    if (!freshId) {
      throw new Error('failed to create flux')
    }
    if (freshId && reactionTo) {
      await this.recountReactions(reactionTo)
    }
    return this.getFlux(freshId)
  }

  async recountReactions(fluxId: number) {
    const reactionCount = await this.db
      .selectFrom('fluxes')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('reaction_to', '=', fluxId)
      .executeTakeFirst()
    await this.db
      .updateTable('fluxes')
      .set({ reactions: Number(reactionCount?.count) })
      .where('id', '=', fluxId)
      .executeTakeFirst()
  }

  async updateFlux(fluxId: number, content: string, authorId: number) {
    return await this.db
      .updateTable('fluxes')
      .set({ content })
      .where('id', '=', fluxId)
      .where('author_id', '=', authorId)
      .returningAll()
      .executeTakeFirst()
  }

  async recountFluxBoosts(fluxId: number) {
    const boostCount = await this.db
      .selectFrom('flux_boosts')
      .select((eb) => eb.fn.count('flux_id').as('count'))
      .where('flux_id', '=', fluxId)
      .executeTakeFirst()

    return await this.db
      .updateTable('fluxes')
      .set({ boosts: Number(boostCount?.count) })
      .where('id', '=', fluxId)
      .executeTakeFirst()
  }

  async boostFlux(fluxId: number, fluxUserId: number) {
    await this.db
      .insertInto('flux_boosts')
      .values({ flux_id: fluxId, flux_user_id: fluxUserId })
      .execute()
    await this.recountFluxBoosts(fluxId)
    return await this.getFlux(fluxId)
  }

  async deboostFlux(fluxId: number, fluxUserId: number) {
    await this.db
      .deleteFrom('flux_boosts')
      .where('flux_id', '=', fluxId)
      .where('flux_user_id', '=', fluxUserId)
      .executeTakeFirst()
    await this.recountFluxBoosts(fluxId)
    return await this.getFlux(fluxId)
  }

  async retallyFluxViews(fluxId: number) {
    const viewCount = await this.db
      .selectFrom('flux_views')
      .select((eb) => eb.fn.count('flux_id').as('count'))
      .where('flux_id', '=', fluxId)
      .executeTakeFirst()

    return await this.db
      .updateTable('fluxes')
      .set({ views: Number(viewCount?.count) })
      .where('id', '=', fluxId)
      .executeTakeFirst()
  }

  /**
   * Register a view for a flux by a user.
   * @param fluxId - The ID of the flux.
   * @param fluxUserId - The ID of the user viewing the flux. Use -1 for anonymous views.
   * @returns The updated flux.
   */
  async registerView(fluxId: number, fluxUserId: number) {
    await this.db
      .insertInto('flux_views')
      .values({ flux_id: fluxId, flux_user_id: fluxUserId })
      .execute()

    await this.retallyFluxViews(fluxId)
    return await this.getFlux(fluxId)
  }

  // subscriptions

  // identity
  async getFluxUser(userId: string) {
    const fluxAuthor = await this.db
      .selectFrom("flux_users as fu")
      .innerJoin("user_profiles as up", "up.id", "fu.user_id")
      .where("fu.user_id", "=", userId)
      .select([
        "fu.id",
        "handle",
        "alias",
        "avatar",
        "fu.created_at",
        "followers",
        "following",
      ])
      .executeTakeFirst();
    return fluxAuthor

  }

  async getFluxUserByHandle(handle: string) {
    const fluxAuthor = await this.db
      .selectFrom("user_profiles as up")
      .innerJoin("flux_users as fu", "fu.user_id", "up.id")
      .where("handle", "=", handle)
      .select([
        "fu.id",
        "handle",
        "alias",
        "avatar",
        "fu.created_at",
        "followers",
        "following",
      ])
      .executeTakeFirst();
    return fluxAuthor
  }

  async getFluxUsers(ids: number[]) {
    const fluxAuthors = await this.db
      .selectFrom("flux_users as fu")
      .innerJoin("user_profiles as up", "up.id", "fu.user_id")
      .where("fu.id", "in", ids)
      .select([
        "fu.id",
        "handle",
        "alias",
        "avatar",
        "fu.created_at",
        "followers",
        "following",
      ])
      .execute();

    return fluxAuthors
  }

  async createFluxUser(userId: string) {
    return await this.db
      .insertInto('flux_users')
      .values({
        user_id: userId,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  }
}