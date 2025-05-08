import { FastifyPluginAsync } from 'fastify'

const eventsRoutes: FastifyPluginAsync = async (fastify, options) => {

  const DEFAULT_LIMIT = 10
  const MAX_LIMIT = 50

  fastify.get<{
    Querystring: {
      limit?: number
      offset?: number
      from?: string
      to?: string
      asc?: boolean
      actor?: string
    }
  }>('/', async (request) => {
    const { limit = DEFAULT_LIMIT, offset = 0, asc = true, from, to, actor } = request.query

    fastify.log.info(`Fetching events: limit=${limit}, offset=${offset}, asc=${asc}, from=${from}, to=${to}, actor=${actor}`)

    const guardedLimit = Math.min(limit, MAX_LIMIT)

    const results = await fastify.data.events.get(guardedLimit, offset, { from, to, asc, actor })

    return {
      items: results,
      total: results.length,
      hasMore: results.length === guardedLimit
    }
  })

  type eventPayload = {
    actor: string | null
    details: string
  }

  fastify.post<{
    Body: eventPayload
  }>('/', async (request, reply) => {
    const actor = request.userId
    const { details } = request.body

    try {
      const event = await fastify.data.events.create(actor, details)
      reply.status(201).send()
    } catch (err) {
      fastify.log.error(err)
      throw fastify.httpErrors.internalServerError('Sorry, something went wrong.')
    }
  })

}

export default eventsRoutes