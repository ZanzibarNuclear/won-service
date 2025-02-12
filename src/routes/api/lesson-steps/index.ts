import { FastifyPluginAsync } from 'fastify'
import { CreateLessonStepSchema, CreateLessonStepType, LessonStepSchema, LessonStepBodySchema, LessonStepBodyType } from '../schema'

const lessonStepRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:id', {
    schema: {
      response: {
        200: LessonStepSchema,
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: number }
    const step = await fastify.data.lessonSteps.get(id)
    if (!step) {
      return reply.code(404).send({ error: 'Lesson step not found' })
    }
    reply.send(step)
  })

  fastify.post('/', {
    schema: {
      body: CreateLessonStepSchema,
      response: {
        201: LessonStepSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role
    const { lessonPath, from, to, teaser } = request.body as CreateLessonStepType
    const lessonStep = await fastify.data.lessonSteps.create(lessonPath, from, to, teaser)
    reply.code(201).send(lessonStep)
  })

  fastify.put('/:id', {
    schema: {
      body: LessonStepBodySchema,
      response: {
        200: LessonStepSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role
    const { id } = request.params as { id: number }
    const { from, to, teaser } = request.body as LessonStepBodyType
    const lessonStep = await fastify.data.lessonSteps.update(id, from, to, teaser)
    if (!lessonStep) {
      return reply.code(404).send({ error: 'Lesson step not found' })
    }
    return lessonStep
  })

  fastify.delete('/:id', async (request, reply) => {
    // TODO: check role
    const { id } = request.params as { id: number }
    return await fastify.data.lessonSteps.delete(id)
  })

}

export default lessonStepRoutes