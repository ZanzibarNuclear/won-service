import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../../utils/roleGuard'

const accessUsersRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  const DEFAULT_LIMIT = 10
  const MAX_LIMIT = 50

  fastify.get<{
    Querystring: {
      limit?: number
      offset?: number
    }
  }>('/', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    const { limit = DEFAULT_LIMIT, offset } = request.query

    const guardedLimit = Math.min(limit, MAX_LIMIT)

    const users = await fastify.data.users.getUsers(guardedLimit, offset)

    return {
      items: users,
      total: users.length,
      hasMore: users.length === guardedLimit
    }
  })
}

export default accessUsersRoutes