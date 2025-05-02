import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { Kysely } from "kysely"
import { DB } from '../types'
import type { FluxFilter } from "../../types/won-flux-types"

export class FluxRepository {
  selectFluxQuery: any

  constructor(private db: Kysely<DB>) {
    this.selectFluxQuery = this.db
      .selectFrom('fluxes')
      .where('deleted_at', 'is', null)
      .selectAll()

    const selectFluxQuery = db
      .selectFrom('fluxes')
      .selectAll()
      .select((eb) => [
        jsonObjectFrom(
          eb.selectFrom('flux_users as author')
            .innerJoin('user_profiles as up', 'up.id', 'author.user_id')
            .select(['author.id', 'up.handle', 'up.alias'])
            .whereRef('author.id', '=', 'fluxes.author_id')
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
      enhancedQuery = enhancedQuery.where('author_id', '=', filter.authorId)
    }
    if (filter.fluxId) {
      enhancedQuery = enhancedQuery.where('reply_to', '=', filter.fluxId)
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
  async createFlux(authorId: number, replyTo: number | null, content: string) {
    let freshFlux = await this.db
      .insertInto('fluxes')
      .values({
        author_id: authorId,
        reply_to: replyTo,
        content: content,
      })
      .returningAll()
      .executeTakeFirst()
    if (freshFlux && replyTo) {
      await this.recountReactions(replyTo)
    }
    return freshFlux
  }

  async recountReactions(fluxId: number) {
    const reactionCount = await this.db
      .selectFrom('fluxes')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('reply_to', '=', fluxId)
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

    // TODO: is there a way to use subquery
    return await this.db
      .updateTable('fluxes')
      .set({ boosts: Number(boostCount?.count) })
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
      .set({ views: Number(viewCount?.count) })
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

  /* ===

  get FluxUser by handle

  SELECT
    "flux_users"."id", 
    "handle", 
    "alias", 
    "avatar", 
    "flux_users"."created_at",
    "following", 
    "followers"
  FROM
    "flux_users"
    INNER JOIN "user_profiles" AS "up" 
    ON "up"."id" = "flux_users"."user_id"
  WHERE
    "up"."handle" = $1;

    === */
  async getFluxUser(userId: number) {
    const fluxAuthor = await this.db
      .selectFrom("flux_users as fu")
      .innerJoin("user_profiles as up", "up.id", "fu.user_id")
      .where("up.id", "=", userId.toString())
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