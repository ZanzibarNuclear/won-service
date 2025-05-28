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
      unresolved?: boolean
    }
  }>('/unresolved', {
    preHandler: roleGuard(['admin'])
  }, async (request, reply) => {
    const { offset, limit = DEFAULT_LIMIT } = request.query
    const guardedLimit = Math.min(limit, MAX_LIMIT)

    const filter = {
      unresolved: true
    }
    const results = await fastify.data.flags.get(offset, guardedLimit, filter)
    return {
      items: results,
      total: results.length,
      hasMore: results.length === guardedLimit
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

    try {
      if (userId) {
        const resolvedFlag = await fastify.data.flags.resolve(flagId, userId, resolutionNote)
        return resolvedFlag
      }
    } catch (error) {
      reply.code(500).send({ message: 'Unable to save resolution', error })
    }
  })
}

export default flagRoutes
