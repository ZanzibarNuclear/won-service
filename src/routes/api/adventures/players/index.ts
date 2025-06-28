import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { PlayerSchema } from '../../../../models'

const playersRoutes: FastifyPluginAsync = async (fastify) => {
  const players = fastify.mongoCollections.players

  // Create
  fastify.post('/players/', async (request, reply) => {
    const parsed = PlayerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await players.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  // Read all
  fastify.get('/players/', async (request, reply) => {
    const all = await players.find().toArray()
    return all
  })

  // Read one
  fastify.get('/players/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await players.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Player not found' })
    return item
  })

  // Update
  fastify.put('/players/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = PlayerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await players.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Player not found' })
    return { _id: id, ...parsed.data }
  })

  // Delete
  fastify.delete('/players/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await players.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Player not found' })
    return { success: true }
  })
}

export default playersRoutes