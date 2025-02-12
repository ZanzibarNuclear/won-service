import { CreateLessonPathSchema, CreateLessonPathType, LessonPathBodyType, LessonPathBodySchema, LessonStepSchema } from './../schema';
import { FastifyPluginAsync } from 'fastify'
import { LessonPathSchema } from '../schema'

const lessonPathRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:key', {
    schema: {
      response: {
        200: LessonPathSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const path = await fastify.data.lessonPaths.get(key)
    if (!path) {
      return reply.code(404).send({ error: 'Lesson path not found' })
    }
    reply.send(path)
  })

  fastify.post('/', {
    schema: {
      body: CreateLessonPathSchema,
      response: {
        201: LessonPathSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role
    const { courseKey, name, description, trailhead } = request.body as CreateLessonPathType
    const lessonPath = await fastify.data.lessonPaths.create(courseKey, name, description, trailhead)

    return reply.code(201).send(lessonPath)
  })

  fastify.put('/:key', {
    schema: {
      body: LessonPathBodySchema,
      response: {
        200: LessonPathSchema,
      }
    }
  }, async (request, reply) => {
    // TODO: check role
    const { key } = request.params as { key: string }
    const { name, description, trailhead } = request.body as LessonPathBodyType
    const lessonPath = await fastify.data.lessonPaths.update(key, name, description, trailhead)

    return reply.code(200).send(lessonPath)
  })

  fastify.delete('/:key', async (request, reply) => {
    // TODO: check role
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPaths.delete(key)
  })

  fastify.get('/:key/lesson-steps', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: LessonStepSchema,
        }
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const steps = await fastify.data.lessonSteps.findByPath(key)
    reply.send(steps)
  })

}

export default lessonPathRoutes