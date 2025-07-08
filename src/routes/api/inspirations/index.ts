import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../utils/roleGuard'

const inspirationsRoutes: FastifyPluginAsync = async (fastify, options) => {

  const DEFAULT_LIMIT = 20
  const MAX_LIMIT = 100

  // Public route to get a random active inspiration
  fastify.get('/random', async (request, reply) => {
    try {
      const inspiration = await fastify.data.inspirations.getRandomActive()
      if (!inspiration) {
        return reply.status(404).send({
          error: 'No active inspirations found',
          fallback: 'Blue is the new green.'
        })
      }
      return inspiration
    } catch (error) {
      fastify.log.error('Error fetching random inspiration:', error)
      return reply.status(500).send({
        error: 'Failed to fetch inspiration',
        fallback: 'Blue is the new green.'
      })
    }
  })

  // Admin routes - require admin role
  fastify.get<{
    Querystring: {
      limit?: number
      offset?: number
      type?: string
      active?: boolean
    }
  }>('/', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    const { limit = DEFAULT_LIMIT, offset = 0, type, active } = request.query

    const guardedLimit = Math.min(limit, MAX_LIMIT)

    try {
      const inspirations = await fastify.data.inspirations.getAll({
        limit: guardedLimit,
        offset,
        type,
        active
      })

      return {
        items: inspirations,
        total: inspirations.length,
        hasMore: inspirations.length === guardedLimit
      }
    } catch (error) {
      fastify.log.error('Error fetching inspirations:', error)
      return reply.status(500).send({ error: 'Failed to fetch inspirations' })
    }
  })

  fastify.get<{
    Params: { id: number }
  }>('/:id', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    const { id } = request.params

    try {
      const inspiration = await fastify.data.inspirations.getById(id)
      if (!inspiration) {
        return reply.status(404).send({ error: 'Inspiration not found' })
      }
      return inspiration
    } catch (error) {
      fastify.log.error('Error fetching inspiration:', error)
      return reply.status(500).send({ error: 'Failed to fetch inspiration' })
    }
  })

  fastify.post<{
    Body: {
      type: string
      title?: string
      content?: string
      media_url?: string
      weight?: number
      active?: boolean
    }
  }>('/', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    const { type, title, content, media_url, weight, active } = request.body

    if (!type) {
      return reply.status(400).send({ error: 'Type is required' })
    }

    try {
      const inspiration = await fastify.data.inspirations.create({
        type,
        title,
        content,
        media_url,
        weight,
        active,
        created_by: request.session?.userId || undefined
      })

      return reply.status(201).send(inspiration)
    } catch (error) {
      fastify.log.error('Error creating inspiration:', error)
      return reply.status(500).send({ error: 'Failed to create inspiration' })
    }
  })

  fastify.put<{
    Params: { id: number }
    Body: {
      type?: string
      title?: string
      content?: string
      media_url?: string
      weight?: number
      active?: boolean
    }
  }>('/:id', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    const { id } = request.params
    const updateData = request.body

    try {
      const inspiration = await fastify.data.inspirations.update(id, updateData)
      if (!inspiration) {
        return reply.status(404).send({ error: 'Inspiration not found' })
      }
      return inspiration
    } catch (error) {
      fastify.log.error('Error updating inspiration:', error)
      return reply.status(500).send({ error: 'Failed to update inspiration' })
    }
  })

  fastify.delete<{
    Params: { id: number }
  }>('/:id', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    const { id } = request.params

    try {
      const inspiration = await fastify.data.inspirations.delete(id)
      if (!inspiration) {
        return reply.status(404).send({ error: 'Inspiration not found' })
      }
      return { message: 'Inspiration deleted successfully' }
    } catch (error) {
      fastify.log.error('Error deleting inspiration:', error)
      return reply.status(500).send({ error: 'Failed to delete inspiration' })
    }
  })

  fastify.put<{
    Params: { id: number }
  }>('/:id/toggle', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    const { id } = request.params

    try {
      const inspiration = await fastify.data.inspirations.toggleActive(id)
      if (!inspiration) {
        return reply.status(404).send({ error: 'Inspiration not found' })
      }
      return inspiration
    } catch (error) {
      fastify.log.error('Error toggling inspiration:', error)
      return reply.status(500).send({ error: 'Failed to toggle inspiration' })
    }
  })

  fastify.get('/stats', {
    preHandler: roleGuard(['admin']),
  }, async (request, reply) => {
    try {
      const stats = await fastify.data.inspirations.getStats()
      return stats
    } catch (error) {
      fastify.log.error('Error fetching inspiration stats:', error)
      return reply.status(500).send({ error: 'Failed to fetch stats' })
    }
  })
}

export default inspirationsRoutes 