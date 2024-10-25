import { FastifyPluginAsync } from 'fastify'
import { db } from '../../../db/Database'

const meRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', {
    handler: async (request, reply) => {
      if (!request.session) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      const user = await db.selectFrom('users').select(['id', 'alias']).where('id', '=', request.session.userId).executeTakeFirst()
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      // Return only the necessary user information
      // TODO: include roles, app enrollments (Flex handle).
      return {
        id: user.id,
        alias: user.alias,
        roles: request.session.roles
      }
    }
  })
}

export default meRoutes
