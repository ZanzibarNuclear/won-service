import { FastifyPluginAsync } from 'fastify'

const exRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async function (request, reply) {
    return 'This is a 2nd example'
  })
}
