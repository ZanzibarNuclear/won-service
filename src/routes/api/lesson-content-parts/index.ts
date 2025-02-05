import { FastifyInstance, FastifyPluginAsync } from 'fastify'

const lessonContentsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  const lessonContentPayloadSchema = {
    lessonKey: { type: 'string' },
    contentPartType: { type: 'string' },
    content: { type: 'string' },
    sequence: { type: 'number' },
  }

  const lessonContentSchema = {
    id: { type: 'number' },
    publicKey: { type: 'string' },
    lessonKey: { type: 'string' },
    contentPartType: { type: 'string' },
    content: { type: 'string' },
    sequence: { type: 'number' },
  }

  fastify.get('/:key', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: lessonContentSchema,
        }
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await fastify.data.lessonContents.getContentPart(key)
    if (!plan) {
      reply.code(404).send()
      return
    }
    reply.send(plan)
  })

  type ContentPartPayload = {
    lessonKey?: string
    contentPartType?: string
    content?: string
    sequence?: number | undefined
  }

  fastify.post('/', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { lessonKey, contentPartType, content, sequence } = request.body as ContentPartPayload
    if (!lessonKey) {
      reply.code(400).send('Lesson key is required')
      return
    }
    if (!contentPartType) {
      reply.code(400).send('Type of content is required')
      return
    }
    const contentPart = await fastify.data.lessonContents.createContentPart(lessonKey, contentPartType, content, sequence)
    fastify.log.info(contentPart)
    reply.code(201).send(contentPart)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { key } = request.params as { key: string }
    const { content, sequence } = request.body as ContentPartPayload
    const contentPart = await fastify.data.lessonContents.updateContentPart(key, content, sequence)
    return contentPart
  })

  fastify.delete('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonContents.deleteContentPart(key)
  })

}

export default lessonContentsRoutes