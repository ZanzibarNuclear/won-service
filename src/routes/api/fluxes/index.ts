import { FastifyPluginAsync } from 'fastify'
import { db } from '../../../db/Database'
import { getFluxes, getFlux, createFlux, getFluxUser } from '../../../db/access/flux'

const fluxesRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return await getFluxes()
  })

  fastify.post('/', async (request, reply) => {
    if (!request.session?.userId) {
      fastify.log.warn(`Only known users may post fluxes`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const author = await getFluxUser(request.session.userId)
    if (!author) {
      fastify.log.warn(`Flux user not found for current user ${request.session.userId}`)
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { parentId, content } = request.body as { parentId: number | null, content: string }
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
    const { fluxId } = request.params as { fluxId: string }
    const { content } = request.body as { content: string }
    const flux = await db.updateTable('fluxes').set({ content }).where('id', '=', Number(fluxId)).executeTakeFirst()
    return flux
  })

  fastify.post('/:fluxId/boost', async (request, reply) => {
    const { fluxId } = request.params as { fluxId: string }
    const { userId } = request.session as { userId: string }
    try {
      const fluxUser = await db.selectFrom('flux_users').select('id').where('user_id', '=', userId).executeTakeFirst()
      if (!fluxUser) {
        return reply.status(404).send({ error: 'Flux user not found' })
      }
      const fluxUserId = fluxUser.id
      await db.insertInto('flux_boosts').values({
        flux_id: Number(fluxId),
        flux_user_id: fluxUserId,
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
    const { userId } = request.session as { userId: string }
    const fluxUser = await db.selectFrom('flux_users').select('id').where('user_id', '=', userId).executeTakeFirst()
    if (!fluxUser) {
      return reply.status(404).send({ error: 'Flux user not found' })
    }
    const fluxUserId = fluxUser.id
    const boost = await db.deleteFrom('flux_boosts').where('flux_id', '=', Number(fluxId)).where('flux_user_id', '=', fluxUserId).execute()
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