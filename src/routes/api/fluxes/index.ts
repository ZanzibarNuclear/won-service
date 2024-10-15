import { FastifyPluginAsync } from 'fastify'

const fluxesRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { message: 'Fluxes found here' }
  })
  fastify.post('/', async (request, reply) => {
    const { fluxUserId, parentFluxId, content } = request.body as { fluxUserId: string, parentFluxId: string, content: string }
    return { message: 'Creating a new flux, I see.' }
  })
}

export default fluxesRoutes