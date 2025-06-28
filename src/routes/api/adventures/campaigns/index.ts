import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from 'mongodb'
import { CampaignSchema } from '../../../../models'

const campaignsRoutes: FastifyPluginAsync = async (fastify) => {
  const campaigns = fastify.mongoCollections.campaigns

  fastify.post('/', async (request, reply) => {
    const parsed = CampaignSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await campaigns.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  fastify.get('/', async (request, reply) => {
    const all = await campaigns.find().toArray()
    return all
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await campaigns.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Campaign not found' })
    return item
  })

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = CampaignSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await campaigns.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data }
    )
    if (result.matchedCount === 0) return reply.status(404).send({ message: 'Campaign not found' })
    return { _id: id, ...parsed.data }
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await campaigns.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Campaign not found' })
    return { success: true }
  })
}

export default campaignsRoutes