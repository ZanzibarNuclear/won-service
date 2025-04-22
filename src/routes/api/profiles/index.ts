import { FastifyPluginAsync } from 'fastify'
import { adjustProfileImagePaths } from '../../../utils'

const profileRoute: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/', async (request, reply) => {
    return { message: 'get public profile' }
  })

  fastify.get('/:handle', async (request, reply) => {
    const { handle } = request.params as { handle: string }
    const profile = await fastify.data.publicProfiles.findByHandle(handle)
    if (!profile) {
      return reply.notFound('No profile with handle ' + handle)
    }
    fastify.log.info(profile)
    const adjusted = adjustProfileImagePaths(profile, fastify.memberImageViewPath)
    return adjusted
  })
}

export default profileRoute
