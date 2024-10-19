import { FastifyPluginAsync } from 'fastify'

const corsPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.register(require('@fastify/cors'), {
    name: 'cors',
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'X-Custom-Header'],
    credentials: true,
  })
}

export default corsPlugin
