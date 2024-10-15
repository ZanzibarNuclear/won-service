import { FastifyPluginAsync } from 'fastify'

const exampleRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { message: 'This is the API root' }
  })
}

export default exampleRoute