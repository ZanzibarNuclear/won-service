import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { LessonContentSchema, LessonContentType, LessonContentBodySchema, LessonContentBodyType } from '../schema'

const lessonContentsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  fastify.get('/:key', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: LessonContentSchema,
        }
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await fastify.data.lessonContents.get(key)
    if (!plan) {
      reply.code(404).send()
      return
    }
    reply.send(plan)
  })

  fastify.post('/', {
    schema: {
      body: LessonContentBodySchema,
      response: {
        201: LessonContentSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role
    const { lessonKey, contentPartType, content, sequence } = request.body as LessonContentBodyType
    if (!lessonKey) {
      reply.code(400).send('Lesson key is required')
      return
    }
    if (!contentPartType) {
      reply.code(400).send('Type of content is required')
      return
    }
    const contentPart = await fastify.data.lessonContents.create(lessonKey, contentPartType, content, sequence)
    fastify.log.info(contentPart)
    reply.code(201).send(contentPart)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role
    const { key } = request.params as { key: string }
    const { content, sequence } = request.body as LessonContentBodyType
    const contentPart = await fastify.data.lessonContents.update(key, content, sequence)
    return contentPart
  })

  fastify.delete('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonContents.delete(key)
  })

}

export default lessonContentsRoutes