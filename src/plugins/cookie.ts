import { FastifyPluginAsync } from 'fastify'
import cookiePlugin from '@fastify/cookie'
import fp from 'fastify-plugin'

const cookiesPlugin: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(cookiePlugin, {
    secret: fastify.config.COOKIE_SECRET,
    parseOptions: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: '.worldofnuclear.com'
    }
  })
  fastify.log.info('registered cookie plugin')
}

export default fp(cookiesPlugin, { name: 'cookie', dependencies: ['env'] })