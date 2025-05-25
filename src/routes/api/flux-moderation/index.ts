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
      offset?: number
      latest?: boolean
      ratings?: string[]
    }
  }>('/ratings', {
    preHandler: roleGuard(['moderator', 'admin'])
  }, async (request, reply) => {
    const { offset, limit, latest, ratings } = request.query

    return fastify.data.fluxModeration.findRatings(offset, limit, ratings, latest)
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

  fastify.get('/authors/:authorId', async (request, reply) => {
    const { authorId } = request.params as { authorId: number }
    const authors = await fastify.data.flux.getFluxUsers([authorId])
    if (authors.length > 0) {
      return authors[0]
    } else {
      return reply.notFound('Flux author not found')
    }
  })

  fastify.get<{
    Querystring: {
      authorIds?: number[]
    }
  }>('/authors', async (request, reply) => {
    const { authorIds } = request.query
    const authors = await fastify.data.flux.getFluxUsers(authorIds || [])
    return authors
  })

  /**
   * This provides an easy way for the moderation bot to see 
   * where it left off, say, in case of a restart.
   */
  fastify.post('/ratings', {
    preHandler: roleGuard(['moderator'])
  }, async (request, reply) => {

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
