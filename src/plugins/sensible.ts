import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import sensiblePlugin, { FastifySensibleOptions } from "@fastify/sensible"

const sensible: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(sensiblePlugin, { errorHandler: false } as FastifySensibleOptions)
  fastify.log.info('registered sensible plugin')
}

export default fp(sensible, { name: 'sensible' })
