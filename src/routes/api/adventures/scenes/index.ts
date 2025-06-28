import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { SceneSchema } from '../../../../models'

/*
 * Encompasses transitions to other scenes.
 */
const scenesRoutes: FastifyPluginAsync = async (fastify) => {
  const scenes = fastify.mongoCollections.scenes

  fastify.post('/', async (request, reply) => {
    const parsed = SceneSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await scenes.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  fastify.get('/', async (request, reply) => {
    const all = await scenes.find().toArray()
    return all
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await scenes.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Scene not found' })
    return item
  })

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = SceneSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await scenes.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Scene not found' })
    return { _id: id, ...parsed.data }
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await scenes.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Scene not found' })
    return { success: true }
  })
}

export default scenesRoutes