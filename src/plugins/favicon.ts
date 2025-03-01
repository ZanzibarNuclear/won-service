import { FastifyPluginAsync } from 'fastify'
import favicon from 'fastify-favicon'
import fp from 'fastify-plugin'

const faviconPlugin: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(favicon, { path: './src/routes' })

  fastify.log.info('registered favicon plugin')
}

export default fp(faviconPlugin, { name: 'favicon', dependencies: ['env'] })