import { FastifyPluginAsync } from 'fastify'

const fluxesRoutes: FastifyPluginAsync = async (fastify, options) => {

  const DEFAULT_FLUXES_LIMIT = 3
  const MAX_FLUXES_LIMIT = 10

  fastify.get<{
    Querystring: {
      limit?: number
      offset?: number
      order?: string
      authorId?: number
      fluxId?: number
    }
  }>('/', async (request, reply) => {
    const { limit, offset, order, authorId, fluxId } = request.query

    fastify.log.info(`Fetching fluxes under constraints -- filter: ${order}, author: ${authorId}, flux: ${fluxId}, limit: ${limit}, offset: ${offset}`)

    // guard against returning too many
    let guardedLimit = DEFAULT_FLUXES_LIMIT
    if (limit && limit > 0) {
      guardedLimit = Math.min(limit, MAX_FLUXES_LIMIT)
      fastify.log.info(`Adjusting limit to ${guardedLimit}`)
    }

    const results = await fastify.data.flux.getFluxes(guardedLimit, offset || 0, { order, authorId, fluxId })
    return { items: results, total: results.length, hasMore: results.length === guardedLimit }
  })

  fastify.post('/', async (request, reply) => {
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const author = await fastify.data.flux.getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { parentId, content } = request.body as { parentId: number | null; content: string }
    const flux = await fastify.data.flux.createFlux(author.id, parentId, content)
    if (!flux) {
      return reply.status(400).send({ error: 'Failed to create flux' })
    }
    reply.send(flux)
  })

  fastify.get('/:fluxId', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: number }
    return await fastify.data.flux.getFlux(fluxId)
  })

  fastify.put('/:fluxId', async (request, reply) => {
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const author = await fastify.data.flux.getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { fluxId } = request.params as { fluxId: number }
    const { content } = request.body as { content: string }
    return await fastify.data.flux.updateFlux(fluxId, content, author.id)
  })

  fastify.post('/:fluxId/view', async (request, reply) => {
    let fluxUserId = -1
    if (request.session?.userId) {
      const fluxUser = await fastify.data.flux.getFluxUser(request.session.userId)
      if (fluxUser) {
        fluxUserId = fluxUser.id
      }
    }
    const { fluxId } = request.params as { fluxId: number }
    try {
      return await fastify.data.flux.countView(fluxId, fluxUserId)
    } catch (error) {
      fastify.log.error(`Failed to record view for flux ${fluxId} by user ${fluxUserId}`)
      return reply.status(500).send({ error: 'Failed to record view' })
    }
  })

  fastify.post('/:fluxId/boost', async (request, reply) => {
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(200)
    }
    const author = await fastify.data.flux.getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { fluxId } = request.params as { fluxId: number }
    try {
      return await fastify.data.flux.boostFlux(fluxId, author.id)
    } catch (error) {
      fastify.log.error(`Failed to boost flux ${fluxId} by user ${author.id}`)
      if ((error as any).code === '23505') {
        return reply.status(201).send({ message: 'Flux already boosted by user' })
      }
      return reply.status(500).send({ message: 'Failed to boost flux' })
    }
  })

  fastify.delete('/:fluxId/boost', async (request, reply) => {
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const author = await fastify.data.flux.getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { fluxId } = request.params as { fluxId: number }
    try {
      return await fastify.data.flux.deboostFlux(fluxId, author.id)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Failed to unboost flux' })
    }
  })
}

export default fluxesRoutes
