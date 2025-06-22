import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { NpcSchema } from '../../../models'

const charactersRoutes: FastifyPluginAsync = async (fastify) => {
  const npcs = fastify.mongoCollections.npcs

  fastify.post('/characters/', async (request, reply) => {
    const parsed = NpcSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await npcs.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  fastify.get('/characters/', async (request, reply) => {
    const all = await npcs.find().toArray()
    return all
  })

  fastify.get('/characters/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await npcs.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Character not found' })
    return item
  })

  fastify.put('/characters/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = NpcSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await npcs.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Character not found' })
    return { _id: id, ...parsed.data }
  })

  fastify.delete('/characters/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await npcs.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Character not found' })
    return { success: true }
  })
}

export default charactersRoutes