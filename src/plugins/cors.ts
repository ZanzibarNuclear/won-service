import { FastifyPluginAsync } from 'fastify'
import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'

const corsPlugin: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(fastifyCors, {
    origin: [
      'http://localhost:3000',
      'https://staging.won-app-next.pages.dev',
      /\.worldofnuclear\.com$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Set-Cookie', 'X-Session-Token'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204
  })
  fastify.log.info('registered cors plugin')
}

export default fp(corsPlugin, { name: 'cors', dependencies: ['env'] })
