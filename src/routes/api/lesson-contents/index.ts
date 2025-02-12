import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { LessonContentSchema, CreateLessonContentSchema, CreateLessonContentType, LessonContentBodySchema, LessonContentBodyType } from '../schema'

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
      body: CreateLessonContentSchema,
      response: {
        201: LessonContentSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role

    const { lessonKey, lessonContentType, content, sequence } = request.body as CreateLessonContentType
    const contentPart = await fastify.data.lessonContents.create(lessonKey, lessonContentType, content, sequence)

    reply.code(201).send(contentPart)
  })

  fastify.put('/:key', {
    schema: {
      body: LessonContentBodySchema,
      response: {
        200: LessonContentSchema,
      },
    },
  }, async (request, reply) => {
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