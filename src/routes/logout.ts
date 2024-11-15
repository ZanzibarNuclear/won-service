import { FastifyPluginAsync } from 'fastify'

const logoutRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.delete('/login', async (request, reply) => {
    fastify.removeSessionToken(reply)
    fastify.log.info('logged out')
    reply.send(true)
  })
}

export default logoutRoute
