import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { db } from '../db/Database'

const dbPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.decorate('db', db)
  fastify.log.info('registered db plugin')
}

export default fp(dbPlugin, { name: 'db' })
