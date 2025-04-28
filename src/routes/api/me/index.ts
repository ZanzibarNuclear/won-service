import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../utils/roleGuard'
import { adjustProfileImagePaths } from '../../../utils'
import { ProfileUpdate } from '../../../types/won-flux-types'


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

  fastify.post('/flux-activation', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      fastify.log.info('setting up Flux for current user')
      const { alias, handle } = request.body as { alias: string, handle: string }
      fastify.log.info('Requesting changes to profile: alias ' + alias + ', handle ' + handle)
      const userId = request.session?.userId
      if (userId) {
        if (!!alias || !!handle) {
          // request profile changes to alias and handle
          await fastify.data.userProfiles.update(userId, {
            alias, handle
          })
        }
        const fluxUser = await fastify.data.flux.createFluxUser(userId)
        fastify.log.info(fluxUser)
        reply.send(fluxUser)
      } else {
        reply.code(400).send('Active user is required')
      }
    }
  })
}

export default meRoutes
