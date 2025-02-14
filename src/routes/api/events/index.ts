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
  }>('/', async (request, reply) => {
    const { limit, offset, asc, from, to, actor } = request.query

    fastify.log.info(`Fetching events: limit=${limit}, offset=${offset}, asc=${asc}, from=${from}, to=${to}, actor=${actor}`)

    // guard against returning too many
    let guardedLimit = DEFAULT_LIMIT
    if (limit && limit > 0) {
      guardedLimit = Math.min(limit, MAX_LIMIT)
      fastify.log.info(`Adjusting limit to ${guardedLimit}`)
    }

    const results = await fastify.data.events.get(guardedLimit, offset, { from, to, asc, actor })

    return { items: results, total: results.length, hasMore: results.length === guardedLimit }
  })

  type eventPayload = {
    actor: string | undefined
    details: string
  }

  fastify.post('/', async (request, reply) => {
    const { details } = request.body as eventPayload
    const actor = request.session?.userId

    let event
    try {
      event = await fastify.data.events.create(actor, details)
    } catch (err) {
      fastify.log.error(err)
      reply.status(500).send('Sorry, something went wrong.')
      return
    }

    reply.status(201).send(event)
  })

}

export default eventsRoutes