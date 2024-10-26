import { FastifyPluginAsync } from 'fastify'
import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'

const corsPlugin: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(fastifyCors, {
    origin: [fastify.config.APP_BASE_URL, fastify.config.API_BASE_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Set-Cookie', 'X-Session-Token'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204
  })
  fastify.log.info('registered cors plugin')
}

export default fp(corsPlugin, { name: 'cors', dependencies: ['env'] })
