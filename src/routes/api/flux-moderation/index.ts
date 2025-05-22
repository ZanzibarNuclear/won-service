import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../utils/roleGuard'

interface FluxRatingBody {
  fluxId: number
  rating: string
  reason: string
}

const fluxModerationRoutes: FastifyPluginAsync = async (fastify) => {

  fastify.get('/rating-levels', async () => {
    return fastify.data.fluxModeration.getRatingLevels()
  })

  fastify.get<{
    Querystring: {
      limit?: number
    }
  }>('/latest-ratings', {
    preHandler: roleGuard(['moderator'])
  }, async (request) => {
    const { limit } = request.query
    return fastify.data.fluxModeration.getLatestRatings(limit)
  })

  fastify.get('/ratings', {
    preHandler: roleGuard(['moderator'])
  }, async () => {
    return fastify.data.fluxModeration.get()
  })

  /**
   * This provides an easy way for the moderation bot to see 
   * where it left off, say, in case of a restart.
   */
  fastify.post('/ratings', {
    preHandler: roleGuard(['moderator'])
  },
    async (request, reply) => {

      // const moderatorId = '658179b5-b6bd-4d79-8960-9e01c933e489'
      const moderatorId = request.userId
      const { fluxId, rating, reason } = request.body as FluxRatingBody

      if (moderatorId) {
        fastify.log.info('Posting a rating for flux ' + fluxId)
        const fluxRating = await fastify.data.fluxModeration.rateFlux(moderatorId, fluxId, rating, reason)
        return fluxRating
      } else {
        reply.code(403).send('Unknown agent')
      }

    })
}

/**
 * TODO: might also be useful to list fluxes without ratings prior to the last rated flux.
 * Sweep for any misses.
 */

export default fluxModerationRoutes
