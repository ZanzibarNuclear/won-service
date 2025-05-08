import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../utils/roleGuard'
import { adjustProfileImagePaths } from '../../../utils'
import { ProfileUpdate } from '../../../types/won-flux-types'

const meRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', {
    handler: async (request, reply) => {
      fastify.log.info('get current user identity and roles')
      if (!request.userId) {
        return {}
      }
      const user = await fastify.data.users.getUser(request.userId)
      if (!user) {
        return {}
      }
      const profile = await fastify.data.userProfiles.get(request.userId)
      const adjustedProfile = adjustProfileImagePaths(profile, fastify.memberImageViewPath)
      const fluxUser = await fastify.data.flux.getFluxUser(request.userId)

      return {
        id: user.id,
        alias: profile?.alias,
        roles: request.session?.roles,
        profile: adjustedProfile,
        fluxUser
      }
    }
  })

  fastify.get('/flux-activation', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      let fluxUser = null
      if (request.session?.userId) {
        fluxUser = await fastify.data.flux.getFluxUser(request.userId!)
      }
      reply.send(fluxUser)
    }
  })

  fastify.post('/flux-activation', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.userId!
      const { alias, handle } = request.body as ProfileUpdate
      if (userId) {
        // apply updates
        if (alias || handle) {
          await fastify.data.userProfiles.update(userId, {
            alias, handle
          })
        }
        const fluxUser = await fastify.data.flux.createFluxUser(userId)
        reply.send(fluxUser)
      } else {
        reply.code(400).send('Active user is required')
      }
    }
  })
}

export default meRoutes
