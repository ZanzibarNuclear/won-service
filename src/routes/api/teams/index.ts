import { FastifyPluginAsync } from 'fastify'
import { db } from '../../../db/Database'

const teamsRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    const teams = await db.selectFrom('teams').selectAll().execute()
    return teams
  })
}

export default teamsRoutes