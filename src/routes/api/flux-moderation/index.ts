import { FastifyPluginAsync } from 'fastify'

interface FluxRatingBody {
  fluxId: number
  ratingCode: string
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
  }>('/latest-ratings', async (request) => {
    const { limit } = request.query
    return fastify.data.fluxModeration.getLatestRatings(limit)
  })

  fastify.get('/ratings', async () => {
    return fastify.data.fluxModeration.get()
  })

  /**
   * This provides an easy way for the moderation bot to see where it left off.
   * In case of a restart.
   */
  fastify.post('/ratings', async (request, reply) => {
    // FIXME: this should come from the session, which ought to verify the identity of the actor
    const moderatorId = '658179b5-b6bd-4d79-8960-9e01c933e489'

    const { fluxId, ratingCode, reason } = request.body as FluxRatingBody

    const fluxRating = await fastify.data.fluxModeration.rateFlux(moderatorId, fluxId, ratingCode, reason)

    return fluxRating
  })
}

/**
 * TODO: might also be useful to list fluxes without ratings prior to the last rated flux.
 * Sweep for any misses.
 */

export default fluxModerationRoutes
