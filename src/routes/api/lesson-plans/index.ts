import { FastifyPluginAsync } from 'fastify'
import { lessonContentSchema } from '../../schema'

const lessonPlanRoutes: FastifyPluginAsync = async (fastify) => {

  const lessonPlanPayloadSchema = {
    courseKey: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    objective: { type: 'string' },
    sequence: { type: 'number' },
    coverArt: { type: 'string' },
  }

  const lessonPlanSchema = {
    type: 'object',
    required: [],
    properties: {
      id: { type: 'number' },
      publicKey: { type: 'string' },
      courseKey: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      objective: { type: 'string' },
      sequence: { type: 'number' },
      coverArt: { type: 'string' },
      createdAt: { type: 'string' },
      publishedAt: { type: 'string' },
      archivedAt: { type: 'string' },
    }
  }

  fastify.get('/:key', {
    schema: {
      response: {
        200: lessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await fastify.data.lessonPlans.get(key)
    if (!plan) {
      reply.code(404).send()
      return
    }
    reply.send(plan)
  })

  type LessonPlanPayload = {
    courseKey: string
    title?: string
    description?: string
    objective?: string | undefined
    sequence?: number | undefined
    coverArt?: string | undefined
  }

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: lessonPlanPayloadSchema,
        required: ['courseKey', 'title'],
      },
      response: {
        201: lessonPlanSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role

    const { courseKey, title, description, objective, sequence, coverArt } = request.body as any
    if (!title) {
      reply.code(400).send('Title is required')
      return
    }
    const plan = await fastify.data.lessonPlans.create(courseKey, title, description, objective, sequence, coverArt)
    fastify.log.info(plan)
    reply.code(201).send(plan)
  })

  fastify.put('/:key', {
    schema: {
      response: {
        200: lessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    // TODO: check role

    const { key } = request.params as { key: string }
    const { title, description, objective, sequence, coverArt } = request.body as LessonPlanPayload
    const plan = await fastify.data.lessonPlans.update(key, title, description, objective, sequence, coverArt)
    return plan
  })

  fastify.delete('/:key', async (request, reply) => {
    // TODO: check role

    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.delete(key)
  })

  // TODO: add error handling for 404 -- for all learning resources

  fastify.put('/:key/publish', {
    schema: {
      response: {
        200: lessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.publish(key)
  })

  fastify.put('/:key/unpublish', {
    schema: {
      response: {
        200: lessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.unpublish(key)
  })

  fastify.put('/:key/archive', {
    schema: {
      response: {
        200: lessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.archive(key)
  })

  fastify.put('/:key/unarchive', {
    schema: {
      response: {
        200: lessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.unarchive(key)
  })

  fastify.get('/:key/content-parts', {
    schema: {
      response: {
        200: {
          type: Array,
          items: lessonContentSchema,
        }
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const contents = await fastify.data.lessonContents.findByLessonPlan(key)
    reply.send(contents)
  })

}

export default lessonPlanRoutes