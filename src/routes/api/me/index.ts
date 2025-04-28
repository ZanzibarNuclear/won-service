import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../utils/roleGuard'
import { adjustProfileImagePaths } from '../../../utils'


const meRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', {
    handler: async (request, reply) => {
      fastify.log.info('get current user identity and roles')
      if (!request.session?.userId) {
        return {}
      }
      const user = await fastify.data.users.getUser(request.session.userId)
      if (!user) {
        return {}
      }
      const profile = await fastify.data.userProfiles.get(request.session.userId)
      const adjustedProfile = adjustProfileImagePaths(profile, fastify.memberImageViewPath)

      return {
        id: user.id,
        alias: profile?.alias,
        roles: request.session.roles,
        profile: adjustedProfile
      }
    }
  })

  fastify.post('/flux', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      fastify.log.info('setting up Flux for current user')
      const { alias, handler } = request.body as { alias: string, handler: string }
      const userId = request.session?.userId

      if (userId) {
        const cleanUpdates = {
          alias, handler
        }
        await fastify.data.userProfiles.update(userId, cleanUpdates)
      }
    }
  })
}

export default meRoutes
