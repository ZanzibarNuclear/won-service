import { FastifyPluginAsync } from 'fastify'
import { LessonPlanSchema, CreateLessonPlanSchema, CreateLessonPlanType, LessonPlanBodySchema, LessonPlanBodyType, LessonContentSchema } from '../schema'

const lessonPlanRoutes: FastifyPluginAsync = async (fastify) => {

  fastify.get('/:key', {
    schema: {
      response: {
        200: LessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await fastify.data.lessonPlans.get(key)
    if (!plan) {
      reply.code(404).send({ error: 'Lesson plan not found' })
      return
    }
    reply.send(plan)
  })

  fastify.post('/', {
    schema: {
      body: CreateLessonPlanSchema,
      response: {
        201: LessonPlanSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role

    const { courseKey, title, description, objective, sequence, coverArt } = request.body as CreateLessonPlanType
    const plan = await fastify.data.lessonPlans.create(courseKey, title, description, objective, sequence, coverArt)
    fastify.log.info(plan)
    reply.code(201).send(plan)
  })

  fastify.put('/:key', {
    schema: {
      response: {
        200: LessonPlanBodySchema,
      }
    }
  }, async (request, reply) => {
    // TODO: check role

    const { key } = request.params as { key: string }
    const { title, description, objective, sequence, coverArt } = request.body as LessonPlanBodyType
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
        200: LessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.publish(key)
  })

  fastify.put('/:key/unpublish', {
    schema: {
      response: {
        200: LessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.unpublish(key)
  })

  fastify.put('/:key/archive', {
    schema: {
      response: {
        200: LessonPlanSchema,
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPlans.archive(key)
  })

  fastify.put('/:key/unarchive', {
    schema: {
      response: {
        200: LessonPlanSchema,
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
          type: 'array',
          items: LessonContentSchema,
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