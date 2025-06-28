import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { ItemSchema } from '../../../../models'

const itemsRoutes: FastifyPluginAsync = async (fastify) => {
  const items = fastify.mongoCollections.items

  // Create
  fastify.post('/items/', async (request, reply) => {
    const parsed = ItemSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await items.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  // Read all
  fastify.get('/items/', async (request, reply) => {
    const all = await items.find().toArray()
    return all
  })

  // Read one
  fastify.get('/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await items.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Item not found' })
    return item
  })

  // Update
  fastify.put('/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = ItemSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await items.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Item not found' })
    return { _id: id, ...parsed.data }
  })

  // Delete
  fastify.delete('/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await items.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Item not found' })
    return { success: true }
  })
}

export default itemsRoutes