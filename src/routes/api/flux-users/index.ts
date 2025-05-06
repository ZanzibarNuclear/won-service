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

interface RouteParams {
  fluxUserId: string;   // Route params are always strings
  handle: string;
}

const fluxUsersRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    const fluxUsers = await db.selectFrom('flux_users').selectAll().execute()
    return fluxUsers
  })

  fastify.get('/:handle', async (request, reply) => {
    const { handle } = request.params as Pick<RouteParams, 'handle'>
    return fastify.data.flux.getFluxUserByHandle(handle)
  })
}

export default fluxUsersRoutes
