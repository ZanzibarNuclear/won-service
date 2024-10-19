import { FastifyPluginAsync } from 'fastify'

const dotenvPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.register(require('@fastify/dotenv'), {
    name: 'dotenv'
  })
}

export default dotenvPlugin
