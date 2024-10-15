import { FastifyPluginAsync } from 'fastify'

const exampleRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/example', async (request, reply) => {
    return { message: 'This is an example route' }
  })
}

export default exampleRoute