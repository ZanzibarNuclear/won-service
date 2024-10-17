import { FastifyPluginAsync } from 'fastify'

const exampleRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { message: 'Flux Service API' }
  })
}

export default exampleRoute