import { db } from "../Database"
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'

// queries
export const getFlux = async (fluxId: number) => {
  return await db.selectFrom('fluxes').selectAll().where('id', '=', fluxId).executeTakeFirst()
}

export const getFluxByAuthorId = async (fluxUserId: number) => {
  return await db.selectFrom('fluxes').selectAll().where('flux_user_id', '=', fluxUserId).orderBy('created_at', 'desc').execute()
}

export const getFluxes = async () => {
  return await db
    .selectFrom('fluxes')
    .selectAll()
    .select((eb) => [
      jsonObjectFrom(
        eb.selectFrom('flux_users as author')
          .select(['author.id', 'author.handle', 'author.display_name'])
          .whereRef('author.id', '=', 'fluxes.flux_user_id')
      ).as('author')
    ])
    .orderBy('fluxes.created_at', 'desc')
    .execute()
}

// mutations

// subscriptions
