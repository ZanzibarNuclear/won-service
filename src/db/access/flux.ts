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

export const getFluxByAuthorId = async (fluxUserId: number) => {
  return await selectFluxQuery
    .where('flux_user_id', '=', fluxUserId)
    .orderBy('created_at', 'desc').execute()
}

export const getFluxes = async () => {
  return await selectFluxQuery
    .orderBy('fluxes.created_at', 'desc')
    .execute()
}

export const getReplies = async (fluxId: number) => {
  return await selectFluxQuery
    .where('parent_id', '=', fluxId)
    .orderBy('created_at', 'desc')
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

// subscriptions

// identity
export const getFluxUser = async (userId: string) => {
  return await db
    .selectFrom('flux_users')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst()
}
