import { FastifyPluginAsync } from 'fastify'
import { db } from '../../../db/Database'

const fluxesRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    const fluxes = await db.selectFrom('fluxes').selectAll().execute()
    return fluxes
  })
  fastify.post('/', async (request, reply) => {
    const { fluxUserId, parentFluxId, content } = request.body as { fluxUserId: string, parentFluxId: string, content: string }
    return { message: 'Creating a new flux, I see.' }
  })
}

export default fluxesRoutes