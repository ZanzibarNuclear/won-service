import { FastifyPluginAsync } from 'fastify'
import cookiePlugin from '@fastify/cookie'
import fp from 'fastify-plugin'

const cookiesPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.log.info(`Registering cookie plugin with COOKIE_SECRET: ${process.env.COOKIE_SECRET}`)
  fastify.log.info(`does fastify also have the cookie secret? ${fastify.config.COOKIE_SECRET}`)
  await fastify.register(cookiePlugin, {
    secret: process.env.COOKIE_SECRET, // for cookies signature
    parseOptions: {
      // secure: true,
      // httpOnly: true
    }  // options for parsing cookies
  })
  fastify.log.info('registered cookie plugin')
}

export default fp(cookiesPlugin, { name: 'cookie', dependencies: ['env'] })