import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { ZoneSchema } from '../../../models'

const zonesRoutes: FastifyPluginAsync = async (fastify) => {
  const zones = fastify.mongoCollections.zones

  fastify.post('/zones/', async (request, reply) => {
    const parsed = ZoneSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await zones.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  fastify.get('/zones/', async (request, reply) => {
    const all = await zones.find().toArray()
    return all
  })

  fastify.get('/zones/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await zones.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Zone not found' })
    return item
  })

  fastify.put('/zones/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = ZoneSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await zones.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Zone not found' })
    return { _id: id, ...parsed.data }
  })

  fastify.delete('/zones/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await zones.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Zone not found' })
    return { success: true }
  })
}

export default zonesRoutes