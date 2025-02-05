import { FastifyInstance, FastifyPluginAsync } from 'fastify'

const courseRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  const coursePayloadSchema = {
    title: { type: 'string' },
    description: { type: 'string' },
    syllabus: { type: 'string' },
    teaser: { type: 'string' },
    coverArt: { type: 'string' },
  }

  const courseSchema = {
    type: 'object',
    required: [],
    properties: {
      id: { type: 'number' },
      publicKey: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      syllabus: { type: 'string' },
      teaser: { type: 'string' },
      coverArt: { type: 'string' },
      createdAt: { type: 'string' },
      publishedAt: { type: 'string' },
      archivedAt: { type: 'string' },
      testOnly: { type: 'boolean' }
    }
  }

  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: courseSchema,
        }
      }
    }
  }, async (request, reply) => {
    return await fastify.data.courses.getCourses()
  })

  fastify.get('/:key', {
    schema: {
      response: {
        200: courseSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses.getCourse(key)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: coursePayloadSchema,
        required: ['title'],
      },
      response: {
        201: courseSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role - only author role

    const { title, description, syllabus, teaser, coverArt } = request.body as any
    if (!title) {
      reply.code(400).send('Title is required')
      return
    }
    const course = await fastify.data.courses.createCourse(title, description, syllabus, teaser, coverArt)

    reply.code(201).send(course)
  })

  fastify.put('/:key', {
    schema: {
      body: {
        type: 'object',
        properties: coursePayloadSchema,
      },
      response: {
        200: courseSchema,
      }
    }
  }, async (request, reply) => {
    // TODO: check role

    const { key } = request.params as { key: string }
    const { title, description, syllabus, teaser, coverArt } = request.body as any
    const course = await fastify.data.courses.updateCourse(key, title, description, syllabus, teaser, coverArt)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.put('/:key/publish', {
    schema: {
      response: {
        200: courseSchema,
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
        200: courseSchema,
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
        200: courseSchema,
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
        200: courseSchema,
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

  fastify.get('/v1/:key/lesson-plans', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await fastify.data.lessonPlans.findByCourse(key)
    reply.send(plans)
  })

  fastify.get('/v1/:key/lesson-paths', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await fastify.data.lessonPaths.findByCourse(key)
    reply.send(plans)
  })

  fastify.delete('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    await fastify.data.courses.deleteCourse(key)
    reply.code(204).send()
  })

}

export default courseRoutes
