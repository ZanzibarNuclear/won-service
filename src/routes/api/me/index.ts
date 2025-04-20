import { FastifyPluginAsync } from 'fastify'
import { ProfileUpdate } from './../../../types/won-flux-types';
import { roleGuard } from '../../../utils/roleGuard'

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
      return {
        id: user.id,
        alias: profile.alias,
        roles: request.session.roles,
        profile
      }
    }
  })

  // fastify.get('/profile', {
  //   preHandler: roleGuard(['member']),
  //   handler: async (request, reply) => {
  //     fastify.log.info('find profile for current user')
  //     const profile = await fastify.data.userProfiles.get(request.session?.userId)
  //     if (!profile) {
  //       return reply.status(404).send()
  //     }
  //     return profile
  //   }
  // })

  // fastify.post('/profile', {
  //   preHandler: roleGuard(['member']),
  //   handler: async (request, reply) => {
  //     fastify.log.info('create profile for current user')
  //     const userId = request.session?.userId
  //     const body = request.body as { alias: string }
  //     return await fastify.data.userProfiles.create(userId, body.alias)
  //   }
  // })

  // fastify.put('/profile', {
  //   preHandler: roleGuard(['member']),
  //   handler: async (request, reply) => {
  //     fastify.log.info('update profile for current user')
  //     const userId = request.session?.userId
  //     const body = request.body as ProfileUpdate
  //     return await fastify.data.userProfiles.update(userId, body)
  //   }
  // })

  // fastify.get('/flux-profile', {
  //   preHandler: roleGuard(['member']),
  //   handler: async (request, reply) => {
  //     fastify.log.info('find flux profile for current user')
  //     const userId = request.session?.userId as string
  //     const fluxProfile = await fastify.data.flux.getFluxUser(userId)
  //     if (!fluxProfile) {
  //       return reply.status(404).send()
  //     }
  //     return fluxProfile
  //   }
  // })

  // fastify.post('/flux-profile', {
  //   preHandler: roleGuard(['member']),
  //   handler: async (request, reply) => {
  //     fastify.log.info('create flux profile for current user')
  //     const userId = request.session?.userId as string
  //     const body = request.body as { handle: string, displayName: string }

  //     fastify.log.info(`creating flux profile for user ${userId}: ${JSON.stringify(body)}`)

  //     // TODO: validate handle and display name
  //     // handle must be unique and can only contain URL-safe characters
  //     // display name cannot have leading or trailing whitespace

  //     //  also, uniqueness might need a few criteria beyond being exactly equal

  //     try {
  //       return await fastify.data.flux.createFluxUser(userId, body.handle, body.displayName)
  //     } catch (err) {
  //       fastify.log.error(err)
  //       return reply.conflict
  //     }
  //   }
  // })
}

export default meRoutes
