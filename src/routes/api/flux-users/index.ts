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

  fastify.get('/id-:fluxUserId', async (request, reply) => {
    const { fluxUserId } = request.params as { fluxUserId: number }
    return fastify.data.flux.getFluxUser(fluxUserId)
  })

  fastify.get('/handle-:handle', async (request, reply) => {
    const { handle } = request.params as { handle: string }
    return fastify.data.flux.getFluxUserByHandle(handle)
  })
}

export default fluxUsersRoutes
