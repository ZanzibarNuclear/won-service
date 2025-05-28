import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../utils/roleGuard'

interface FluxFlagBody {
  fluxId: number
  reasons: string[]
  message?: string
}

interface FlagUpdateBody {
  resolutionNote: string
}
interface FluxIdParams {
  fluxId: number
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

const flagRoutes: FastifyPluginAsync = async (fastify) => {

  fastify.get('/reason-codes', async () => {
    fastify.log.info('request to get rating levels')
    return await fastify.data.flags.getObjectionReasons()
  })

  fastify.get<{
    Querystring: {
      limit?: number
      offset?: number
      latest?: boolean
      ratings?: string[]
      needsReview?: boolean
    }
  }>('/', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { offset, limit = DEFAULT_LIMIT, latest, ratings, needsReview } = request.query
    const guardedLimit = Math.min(limit, MAX_LIMIT)

    const results = await fastify.data.fluxRating.findRatings(offset, guardedLimit, ratings, latest, needsReview)
    return {
      items: results,
      total: results.length,
      hasMore: results.length === guardedLimit
    }
  })

  fastify.get<{
    Querystring: {
      offset?: number
      limit?: number
    }
  }>('/unresolved', {
    preHandler: roleGuard(['admin'])
  }, async (request) => {
    const { offset, limit = DEFAULT_LIMIT } = request.query
    const guardedLimit = Math.min(limit, MAX_LIMIT)

    const unrated = await fastify.data.fluxRating.findUnratedFluxes(offset, limit)

    return {
      items: unrated,
      total: unrated.length,
      hasMore: unrated.length === guardedLimit
    }
  })

  /**
   * This provides an easy way for the moderation bot to see 
   * where it left off, say, in case of a restart.
   */
  fastify.post('/flux', {
    preHandler: roleGuard(['member'])
  }, async (request, reply) => {

    const reporter = request.userId
    const { fluxId, reasons, message } = request.body as FluxFlagBody

    if (reporter) {
      const fluxRating = await fastify.data.flags.flagFluxPost(reporter, fluxId, reasons, message)
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
      flagId: number
    }
  }>('/resolution/:flagId', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { flagId } = request.params
    const userId = request.userId
    const { resolutionNote } = request.body as FlagUpdateBody

    // const resolvedFlag = await fastify.data.flags.resolve(flagId, userId, resolutionNote)

    // return resolvedFlag
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
    const updatedFlux = await fastify.data.flux.deleteFlux(fluxId)

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
    const updatedFlux = await fastify.data.flux.restoreFlux(fluxId)

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
    const updatedFlux = await fastify.data.flux.blockFlux(fluxId)

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
    const updatedFlux = await fastify.data.flux.unblockFlux(fluxId)

    if (!updatedFlux) {
      return reply.notFound(`Flux with ID ${fluxId} not found`)
    }

    return updatedFlux
  })
}

export default flagRoutes
