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

// mutations
export const createFlux = async (fluxUserId: number, parentId: number | null, content: string) => {
  const flux = await db
    .insertInto('fluxes')
    .values({
      flux_user_id: fluxUserId,
      parent_id: parentId,
      content: content,
    })
    .returning(['id'])
    .executeTakeFirst()

  return flux
}

// subscriptions


// identity
export const getFluxUser = async (userId: string) => {
  return await db.selectFrom('flux_users').selectAll().where('user_id', '=', userId).executeTakeFirst()
}
