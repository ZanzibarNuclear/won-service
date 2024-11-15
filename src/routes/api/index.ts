import { FastifyPluginAsync } from 'fastify'

const rootRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { message: 'Flux Service API' }
  })

  fastify.delete('/logout', async (request, reply) => {
    fastify.removeSessionToken(reply)
    fastify.log.info('logged out')
    return true
  })
}

export default rootRoute