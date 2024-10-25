import { FastifyPluginAsync } from 'fastify'
import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'

const corsPlugin: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(fastifyCors, {
    origin: ['http://localhost:3000', 'http://localhost:3030'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
  fastify.log.info('registered cors plugin')
}

export default fp(corsPlugin, { name: 'cors' })
