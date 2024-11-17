import { FastifyPluginAsync } from 'fastify'
import {
  getFluxes,
  getFlux,
  createFlux,
  getFluxUser,
  updateFlux,
  boostFlux,
  deboostFlux,
  getReplies,
} from '../../../db/access/flux'

const fluxesRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    const { filter, author, limit, offset } = request.query as { filter: string; author: string; limit: number; offset: number }

    fastify.log.info(`Fetching fluxes under constraints -- filter: ${filter}, author: ${author}, limit: ${limit}, offset: ${offset}`)
    const results = await getFluxes(filter, author, limit, offset)
    return { items: results, total: results.length, hasMore: results.length === limit }
  })

  fastify.post('/', async (request, reply) => {
    // TODO: check this in one place for all guarded routes -- need way to know which are guarded
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const author = await getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { parentId, content } = request.body as { parentId: number | null; content: string }
    const flux = await createFlux(author.id, parentId, content)
    if (!flux) {
      fastify.log.error(`Failed to create flux for user ${author.id}`)
      return reply.status(400).send({ error: 'Failed to create flux' })
    }
    return await getFlux(flux.id)
  })

  fastify.get('/:fluxId', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: number }
    return await getFlux(fluxId)
  })

  fastify.put('/:fluxId', async (request, reply) => {
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const author = await getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { fluxId } = request.params as { fluxId: number }
    const { content } = request.body as { content: string }
    const flux = await updateFlux(fluxId, content, author.id)
    return flux
  })

  fastify.get('/:fluxId/replies', async (request, reply) => {

    // TODO: add pagination

    const { fluxId } = request.params as { fluxId: number }
    return await getReplies(fluxId)
  })

  fastify.post('/:fluxId/boost', async (request, reply) => {
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const author = await getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { fluxId } = request.params as { fluxId: number }
    try {
      return await boostFlux(fluxId, author.id)
    } catch (error) {
      console.error(error)
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
    const author = await getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { fluxId } = request.params as { fluxId: number }
    try {
      return await deboostFlux(fluxId, author.id)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Failed to unboost flux' })
    }
  })
}

export default fluxesRoutes
