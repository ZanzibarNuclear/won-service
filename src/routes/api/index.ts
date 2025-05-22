import { FastifyPluginAsync } from 'fastify'

const rootRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { message: 'Flux Service API' }
  })

  fastify.get('/about', async (request, reply) => {
    const latestEvent = await fastify.data.events.get(1, 0, {})
    return {
      fastifyVersion: fastify.version,
      latestEvent: latestEvent,
      message: 'Hello, pretty bots.'
    }
  })

  fastify.get('/image-config', async (request, reply) => {
    return {
      avatarBaseUrl: fastify.memberImageViewPath
    }
  })

  fastify.delete('/logout', async (request, reply) => {
    fastify.removeSessionToken(reply)
    fastify.log.info('logged out')
    return true
  })
}

export default rootRoute