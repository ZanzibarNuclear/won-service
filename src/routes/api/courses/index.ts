import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { FastifyRequest } from 'fastify/types/request'
import { CourseBodySchema, CourseBodyType, CreateCourseSchema, CreateCourseType, CourseSchema, LessonPlanSchema, LessonPathSchema } from '../schema'

const courseRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  fastify.get<{
    Querystring: {
      published?: boolean,
      archived?: boolean
    }
  }>('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: CourseSchema,
        }
      }
    }
  }, async (request, reply) => {
    const { published, archived } = request.query
    const courses = await fastify.data.courses.find({ published, archived })
    return courses
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
      throw fastify.httpErrors.notFound('Course not found')
    }
    return course
  })

  fastify.post('/', {
    schema: {
      body: CreateCourseSchema,
      response: {
        201: CourseSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role - only author role

    const { title, description, syllabus, teaser, coverArt } = request.body as CreateCourseType
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

  const updateCourseState = async (request: FastifyRequest, stateChange: 'publish' | 'unpublish' | 'archive' | 'unarchive') => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses[stateChange](key)
    if (!course) {
      throw fastify.httpErrors.notFound('Course not found')
    }
    return course
  }

  fastify.put('/:key/publish', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request) => updateCourseState(request, 'publish'))

  fastify.put('/:key/unpublish', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request) => updateCourseState(request, 'unpublish'))

  fastify.put('/:key/archive', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request) => updateCourseState(request, 'archive'))

  fastify.put('/:key/unarchive', {
    schema: {
      response: {
        200: CourseSchema,
      }
    }
  }, async (request) => updateCourseState(request, 'unarchive'))

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
