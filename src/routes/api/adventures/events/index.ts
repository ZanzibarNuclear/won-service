import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { EventSchema } from '../../../../models'

const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  const events = fastify.mongoCollections.events

  fastify.post('/events/', async (request, reply) => {
    const parsed = EventSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await events.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  fastify.get('/events/', async (request, reply) => {
    const all = await events.find().toArray()
    return all
  })

  fastify.get('/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await events.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Event not found' })
    return item
  })

  fastify.put('/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = EventSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await events.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Event not found' })
    return { _id: id, ...parsed.data }
  })

  fastify.delete('/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await events.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Event not found' })
    return { success: true }
  })
}

export default eventsRoutes