import { FastifyPluginAsync } from 'fastify'
import { createEvent, getEvents } from '../../../db/access/event'

const eventsRoutes: FastifyPluginAsync = async (fastify, options) => {

  type eventPayload = {
    actor: string | undefined
    details: string
  }

  fastify.post('/', async (request, reply) => {
    const { details } = request.body as eventPayload
    const actor = request.session?.userId
    const event = await createEvent(actor, details)
    return event
  })

  const DEFAULT_LIMIT = 10
  const MAX_LIMIT = 50

  // TODO: support date range

  fastify.get<{
    Querystring: {
      limit?: number
      offset?: number
      from?: string
      to?: string
      asc?: boolean
      actor?: string
    }
  }>('/', async (request, reply) => {
    const { limit, offset, asc, from, to, actor } = request.query

    fastify.log.info(`Fetching events: limit=${limit}, offset=${offset}, asc=${asc}, from=${from}, to=${to}, actor=${actor}`)

    // guard against returning too many
    let guardedLimit = DEFAULT_LIMIT
    if (limit && limit > 0) {
      guardedLimit = Math.min(limit, MAX_LIMIT)
      fastify.log.info(`Adjusting limit to ${guardedLimit}`)
    }

    const results = await getEvents(guardedLimit, offset || 0, { from, to, asc, actor })

    return { items: results, total: results.length, hasMore: results.length === guardedLimit }
  })

}