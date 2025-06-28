import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { StorylineSchema } from '../../../../models'

const storylinesRoutes: FastifyPluginAsync = async (fastify) => {
  const storylines = fastify.mongoCollections.storylines

  // Create
  fastify.post('/', async (request, reply) => {
    const parsed = StorylineSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await storylines.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  // Read all
  fastify.get('/', async (request, reply) => {
    const all = await storylines.find().toArray()
    return all
  })

  // Read one
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await storylines.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Storyline not found' })
    return item
  })

  // Update
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = StorylineSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await storylines.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Storyline not found' })
    return { _id: id, ...parsed.data }
  })

  // Delete
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await storylines.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Storyline not found' })
    return { success: true }
  })
}

export default storylinesRoutes