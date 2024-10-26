import { FastifyPluginAsync } from 'fastify'
import { db } from '../../../db/Database'

const meRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', {
    handler: async (request, reply) => {
      fastify.log.info('getting current user identity and roles')
      if (!request.session) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }
      const user = await db.selectFrom('users').select(['id', 'alias']).where('id', '=', request.session.userId).executeTakeFirst()
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }
      fastify.log.info(`current user: ${JSON.stringify(user)}`)
      return {
        id: user.id,
        alias: user.alias,
        roles: request.session.roles
      }
    }
  })

  fastify.get('/flux-profile', {
    handler: async (request, reply) => {
      fastify.log.info('find flux profile for current user')
      if (!request.session) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }
      const userId = request.session.userId
      const fluxProfile = await db.selectFrom('flux_users').where('user_id', '=', userId).selectAll().executeTakeFirst()
      if (!fluxProfile) {
        return reply.status(404).send()
      }
      fastify.log.info(`found flux profile: ${JSON.stringify(fluxProfile)}`)
      return fluxProfile
    }
  })

  fastify.post('/flux-profile', {
    handler: async (request, reply) => {
      fastify.log.info('create flux profile for current user')
      if (!request.session) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }
      const userId = request.session.userId
      const body = request.body as { handle: string, displayName: string }

      // TODO: validate handle and display name
      // handle must be unique and can only contain URL-safe characters
      // display name cannot have leading or trailing whitespace
      //  also, uniqueness might need a few criteria beyond being exactly equal

      const newFluxProfile = await db.insertInto('flux_users').values({
        user_id: userId,
        handle: body.handle,
        display_name: body.displayName
      }).returningAll().executeTakeFirstOrThrow()

      fastify.log.info(`created flux profile: ${JSON.stringify(newFluxProfile)}`)
      return newFluxProfile
    }
  })
}

export default meRoutes
