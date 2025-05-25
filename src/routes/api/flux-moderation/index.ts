import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../utils/roleGuard'

interface FluxRatingBody {
  fluxId: number
  rating: string
  reason: string
}

interface FluxRatingUpdateBody {
  actionTaken: 'accepted' | 'modified'
  reviewNote: string
  rating?: string
}

interface FluxIdParams {
  fluxId: number
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

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
      needsReview?: boolean
    }
  }>('/ratings', {
    preHandler: roleGuard(['moderator', 'admin'])
  }, async (request, reply) => {
    const { offset, limit, latest, ratings, needsReview } = request.query

    return fastify.data.fluxModeration.findRatings(offset, limit, ratings, latest, needsReview)
  })

  fastify.get<{
    Querystring: {
      offset?: number
      limit?: number
    }
  }>('/unrated-fluxes', {
    preHandler: roleGuard(['moderator'])
  }, async (request) => {
    const { offset, limit = DEFAULT_LIMIT } = request.query
    const guardedLimit = Math.min(limit, MAX_LIMIT)

    const unrated = await fastify.data.fluxModeration.findUnratedFluxes(offset, limit)

    return {
      items: unrated,
      count: unrated.length,
      hasMore: unrated.length === guardedLimit
    }
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

  /**
   * Allows admins to update existing ratings with action_taken and review_note
   * Optionally allows changing the rating itself
   */
  fastify.put<{
    Params: {
      ratingId: number
    }
  }>('/ratings/:ratingId', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { ratingId } = request.params
    const userId = request.userId
    const updateData = request.body as FluxRatingUpdateBody

    if (!userId) {
      return reply.code(403).send('Unknown agent')
    }

    // Validate action_taken value
    if (!['accepted', 'modified'].includes(updateData.actionTaken)) {
      return reply.code(400).send('Invalid action_taken value. Must be "accepted" or "modified"')
    }

    // Check if rating exists
    const existingRating = await fastify.data.fluxModeration.getRatingById(ratingId)
    if (!existingRating) {
      return reply.notFound('Rating not found')
    }

    fastify.log.info(`Updating rating ${ratingId} with action: ${updateData.actionTaken}`)
    const updatedRating = await fastify.data.fluxModeration.updateRating(
      ratingId,
      userId,
      updateData
    )

    return updatedRating
  })

  /**
   * Marks a flux as deleted by setting its deleted_at timestamp
   */
  fastify.put<{
    Params: FluxIdParams
  }>('/fluxes/:fluxId/delete', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { fluxId } = request.params
    const userId = request.userId

    if (!userId) {
      return reply.code(403).send('Unknown agent')
    }

    fastify.log.info(`Admin ${userId} is deleting flux ${fluxId}`)
    const updatedFlux = await fastify.data.fluxModeration.deleteFlux(fluxId)

    if (!updatedFlux) {
      return reply.notFound(`Flux with ID ${fluxId} not found`)
    }

    return updatedFlux
  })

  /**
   * Restores a previously deleted flux by clearing its deleted_at timestamp
   */
  fastify.put<{
    Params: FluxIdParams
  }>('/fluxes/:fluxId/restore', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { fluxId } = request.params
    const userId = request.userId

    if (!userId) {
      return reply.code(403).send('Unknown agent')
    }

    fastify.log.info(`Admin ${userId} is restoring flux ${fluxId}`)
    const updatedFlux = await fastify.data.fluxModeration.restoreFlux(fluxId)

    if (!updatedFlux) {
      return reply.notFound(`Flux with ID ${fluxId} not found`)
    }

    return updatedFlux
  })

  /**
   * Blocks a flux by setting its blocked_at timestamp
   */
  fastify.put<{
    Params: FluxIdParams
  }>('/fluxes/:fluxId/block', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { fluxId } = request.params
    const userId = request.userId

    if (!userId) {
      return reply.code(403).send('Unknown agent')
    }

    fastify.log.info(`Admin ${userId} is blocking flux ${fluxId}`)
    const updatedFlux = await fastify.data.fluxModeration.blockFlux(fluxId)

    if (!updatedFlux) {
      return reply.notFound(`Flux with ID ${fluxId} not found`)
    }

    return updatedFlux
  })

  /**
   * Unblocks a previously blocked flux by clearing its blocked_at timestamp
   */
  fastify.put<{
    Params: FluxIdParams
  }>('/fluxes/:fluxId/unblock', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { fluxId } = request.params
    const userId = request.userId

    if (!userId) {
      return reply.code(403).send('Unknown agent')
    }

    fastify.log.info(`Admin ${userId} is unblocking flux ${fluxId}`)
    const updatedFlux = await fastify.data.fluxModeration.unblockFlux(fluxId)

    if (!updatedFlux) {
      return reply.notFound(`Flux with ID ${fluxId} not found`)
    }

    return updatedFlux
  })
}

export default fluxModerationRoutes
