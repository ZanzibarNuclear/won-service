import { FastifyPluginAsync } from 'fastify'
import { db } from '../../../db/Database'

interface FluxUser {
  id: number
  handle: string
  alias: string
  avatar: string
  followers: number
  following: number
}

const fluxUsersRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    const fluxUsers = await db.selectFrom('flux_users').selectAll().execute()
    return fluxUsers
  })

  fastify.get('/:handle', async (request, reply) => {
    const { handle } = request.params as { handle: string }
    const rows = await db
      .selectFrom("flux_users")
      .innerJoin("user_profiles", "user_profiles.id", "flux_users.user_id")
      .where("user_profiles.handle", "=", handle)
      .selectAll()
      .executeTakeFirst();

    return rows
  })
}

export default fluxUsersRoutes
