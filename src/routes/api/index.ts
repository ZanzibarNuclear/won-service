import { FastifyPluginAsync } from 'fastify'

const rootRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { message: 'Flux Service API' }
  })
}

export default rootRoute