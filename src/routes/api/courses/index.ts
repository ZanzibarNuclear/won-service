import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { CourseBodySchema, CourseBodyType, CourseSchema, LessonPlanSchema, LessonPathSchema } from '../schema'

const courseRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: CourseSchema,
        }
      }
    }
  }, async (request, reply) => {
    return await fastify.data.courses.findAll()
  })

  fastify.get('/:key', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses.get(key)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.post('/', {
    schema: {
      body: CourseBodySchema,
      response: {
        201: CourseSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role - only author role

    const { title, description, syllabus, teaser, coverArt } = request.body as CourseBodyType
    if (!title) {
      reply.code(400).send('Title is required')
      return
    }
    const course = await fastify.data.courses.create(title, description, syllabus, teaser, coverArt)

    reply.code(201).send(course)
  })

  fastify.put('/:key', {
    schema: {
      body: CourseBodySchema,
      response: {
        200: CourseSchema,
      }
    }
  }, async (request, reply) => {
    // TODO: check role

    const { key } = request.params as { key: string }
    const { title, description, syllabus, teaser, coverArt } = request.body as CourseBodyType
    const course = await fastify.data.courses.update(key, title, description, syllabus, teaser, coverArt)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.put('/:key/publish', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses.publish(key)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.put('/:key/unpublish', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses.unpublish(key)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.put('/:key/archive', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses.archive(key)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.put('/:key/unarchive', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses.unarchive(key)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.get('/:key/lesson-plans', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: LessonPlanSchema,
        }
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await fastify.data.lessonPlans.findByCourse(key)
    reply.send(plans)
  })

  fastify.get('/:key/lesson-paths', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: LessonPathSchema,
        }
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await fastify.data.lessonPaths.findByCourse(key)
    reply.send(plans)
  })

  fastify.delete('/:key', async (request, reply) => {
    // TODO: check role

    const { key } = request.params as { key: string }
    await fastify.data.courses.delete(key)
    reply.code(204).send()
  })

}

export default courseRoutes
