import { db } from "../Database"
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'

const selectFluxQuery = db
  .selectFrom('fluxes')
  .selectAll()
  .select((eb) => [
    jsonObjectFrom(
      eb.selectFrom('flux_users as author')
        .select(['author.id', 'author.handle', 'author.display_name'])
        .whereRef('author.id', '=', 'fluxes.flux_user_id')
    ).as('author')
  ])

// queries
export const getFlux = async (fluxId: number) => {
  return await selectFluxQuery
    .where('id', '=', fluxId)
    .executeTakeFirst()
}

export interface FluxFilter {
  order?: string
  authorId?: number
  fluxId?: number
}

export const getFluxes = async (limit: number, offset: number, filter: FluxFilter) => {
  let enhancedQuery = selectFluxQuery
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
export const createFlux = async (fluxUserId: number, parentId: number | null, content: string) => {
  let freshFlux = await db
    .insertInto('fluxes')
    .values({
      flux_user_id: fluxUserId,
      parent_id: parentId,
      content: content,
    })
    .returning(['id'])
    .executeTakeFirst()
  if (freshFlux && parentId) {
    await recountReactions(parentId)
  }
  return freshFlux
}

export const recountReactions = async (fluxId: number) => {
  const reactionCount = await db
    .selectFrom('fluxes')
    .select((eb) => eb.fn.count('id').as('count'))
    .where('parent_id', '=', fluxId)
    .executeTakeFirst()
  await db
    .updateTable('fluxes')
    .set({ reply_count: Number(reactionCount?.count) })
    .where('id', '=', fluxId)
    .executeTakeFirst()
}

export const updateFlux = async (fluxId: number, content: string, authorId: number) => {
  return await db
    .updateTable('fluxes')
    .set({ content })
    .where('id', '=', fluxId)
    .where('flux_user_id', '=', authorId)
    .executeTakeFirst()
}

export const recountFluxBoosts = async (fluxId: number) => {
  const boostCount = await db
    .selectFrom('flux_boosts')
    .select((eb) => eb.fn.count('flux_id').as('count'))
    .where('flux_id', '=', fluxId)
    .executeTakeFirst()
  await db
    .updateTable('fluxes')
    .set({ boost_count: Number(boostCount?.count) })
    .where('id', '=', fluxId)
    .executeTakeFirst()
}

export const boostFlux = async (fluxId: number, fluxUserId: number) => {
  await db
    .insertInto('flux_boosts')
    .values({ flux_id: fluxId, flux_user_id: fluxUserId })
    .executeTakeFirst()
  await recountFluxBoosts(fluxId)
  return await getFlux(fluxId)
}

export const deboostFlux = async (fluxId: number, fluxUserId: number) => {
  await db
    .deleteFrom('flux_boosts')
    .where('flux_id', '=', fluxId)
    .where('flux_user_id', '=', fluxUserId)
    .executeTakeFirst()
  await recountFluxBoosts(fluxId)
  return await getFlux(fluxId)
}

const retallyFluxViews = async (fluxId: number) => {
  const viewCount = await db
    .selectFrom('flux_views')
    .select((eb) => eb.fn.count('flux_id').as('count'))
    .where('flux_id', '=', fluxId)
    .executeTakeFirst()
  await db
    .updateTable('fluxes')
    .set({ view_count: Number(viewCount?.count) })
    .where('id', '=', fluxId)
    .executeTakeFirst()
}

/**
 * Count a view for a flux by a user.
 * @param fluxId - The ID of the flux.
 * @param fluxUserId - The ID of the user viewing the flux. Use -1 for anonymous views.
 * @returns The updated flux.
 */
export const countView = async (fluxId: number, fluxUserId: number) => {
  await db
    .insertInto('flux_views')
    .values({ flux_id: fluxId, flux_user_id: fluxUserId })
    .execute()
  await retallyFluxViews(fluxId)
  return await getFlux(fluxId)
}

// subscriptions

// identity
export const getFluxUser = async (userId: string) => {
  return await db
    .selectFrom('flux_users')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst()
}
