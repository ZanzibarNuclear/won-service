import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { RoomSchema } from '../../../models'

const roomsRoutes: FastifyPluginAsync = async (fastify) => {
  const rooms = fastify.mongoCollections.rooms

  fastify.post('/rooms/', async (request, reply) => {
    const parsed = RoomSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await rooms.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  fastify.get('/rooms/', async (request, reply) => {
    const all = await rooms.find().toArray()
    return all
  })

  fastify.get('/rooms/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await rooms.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Room not found' })
    return item
  })

  fastify.put('/rooms/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = RoomSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await rooms.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Room not found' })
    return { _id: id, ...parsed.data }
  })

  fastify.delete('/rooms/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await rooms.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Room not found' })
    return { success: true }
  })
}

export default roomsRoutes