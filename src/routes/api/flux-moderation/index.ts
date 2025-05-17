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
    return fastify.data.fluxModeration.latestFluxRatings(limit)
  })

  fastify.post('/ratings', async (request) => {
    // FIXME: this should come from the session, which ought to verify the identity of the actor
    const moderatorId = '31f11824-af44-4959-95be-e542037dce9b'

    const { fluxId, ratingCode, reason } = request.body as FluxRatingBody

    const fluxRating = await fastify.data.fluxModeration.rateFlux(moderatorId, fluxId, ratingCode, reason)

    return fluxRating
  })
}

export default fluxModerationRoutes
