import { FastifyPluginAsync } from 'fastify'
import { db } from '../../../db/Database'

const fluxesRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    const fluxes = await db.selectFrom('fluxes').selectAll().execute()
    return fluxes
  })

  fastify.post('/', async (request, reply) => {
    const { fluxUserId, parentFluxId, content } = request.body as { fluxUserId: string, parentFluxId: string, content: string }
    const flux = await db.insertInto('fluxes').values({
      flux_user_id: Number(fluxUserId),
      parent_id: parentFluxId ? Number(parentFluxId) : null,
      content,
    }).executeTakeFirst()
    return flux
  })

  fastify.get('/:fluxId', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: string }
    const flux = await db.selectFrom('fluxes').selectAll().where('id', '=', Number(fluxId)).executeTakeFirst()
    return flux
  })

  fastify.put('/:fluxId', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: string }
    const { content } = request.body as { content: string }
    const flux = await db.updateTable('fluxes').set({ content }).where('id', '=', Number(fluxId)).executeTakeFirst()
    return flux
  })

  fastify.post('/:fluxId/boost', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: string }
    const { fluxUserId } = request.body as { fluxUserId: string }
    try {
      const boost = await db.insertInto('flux_boosts').values({
        flux_id: Number(fluxId),
        flux_user_id: Number(fluxUserId),
      }).execute()
    } catch (error) {
      console.error(error)
      if ((error as any).code === '23505') {
        return reply.status(201).send({ message: 'Flux already boosted by user' })
      }
      return reply.status(500).send({ message: 'Failed to boost flux' })
    }
  })

  fastify.delete('/:fluxId/boost', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: string }
    const { fluxUserId } = request.body as { fluxUserId: string }
    const boost = await db.deleteFrom('flux_boosts').where('flux_id', '=', Number(fluxId)).where('flux_user_id', '=', Number(fluxUserId)).execute()
    fastify.log.info({ boost }, 'Unboosted flux')
    return reply.status(200).send({ message: 'Flux unboosted' })
  })

  fastify.get('/:fluxId/replies', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: string }
    const replies = await db.selectFrom('fluxes').selectAll().where('parent_id', '=', Number(fluxId)).execute()
    return replies
  })
}

export default fluxesRoutes