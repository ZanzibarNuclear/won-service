import { FastifyPluginAsync } from 'fastify'
import { ItemSchema } from '../../../../models'
import { ObjectId } from 'mongodb'

const ItemResponseSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    // Add your item properties here, e.g.:
    name: { type: 'string' },
    description: { type: 'string' },
    // ...other fields from ItemSchema...
  },
  required: ['_id', 'name', 'description'], // adjust as needed
}

const ErrorResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  }
}

const itemsRoutes: FastifyPluginAsync = async (fastify) => {
  const items = fastify.mongoCollections.items

  // Create
  fastify.post('/', {
    schema: {
      summary: 'Create an item',
      body: ItemSchema,
      response: {
        200: ItemResponseSchema,
        400: ErrorResponseSchema
      }
    }
  }, async (request, reply) => {
    const parsed = ItemSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(parsed.error)
    }
    const result = await items.insertOne(parsed.data)
    return { _id: result.insertedId, ...parsed.data }
  })

  // Read all
  fastify.get('/', {
    schema: {
      summary: 'Get all items',
      response: {
        200: {
          type: 'array',
          items: ItemResponseSchema
        }
      }
    }
  }, async (request, reply) => {
    const all = await items.find().toArray()
    return all
  })

  // Read one
  fastify.get('/:id', {
    schema: {
      summary: 'Get an item by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: ItemResponseSchema,
        404: ErrorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const item = await items.findOne({ _id: new ObjectId(id) })
    if (!item) return reply.status(404).send({ message: 'Item not found' })
    return item
  })

  // Update
  fastify.put('/:id', {
    schema: {
      summary: 'Update an item by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: ItemSchema,
      response: {
        200: ItemResponseSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema
      }
    }
  }, async (request, reply) => {
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
  fastify.delete('/:id', {
    schema: {
      summary: 'Delete an item by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: { success: { type: 'boolean' } }
        },
        404: ErrorResponseSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await items.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return reply.status(404).send({ message: 'Item not found' })
    return { success: true }
  })
}

export default itemsRoutes