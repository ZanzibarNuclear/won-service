import { FastifyPluginAsync } from 'fastify'
import { lessonStepPayloadSchema, lessonStepSchema } from '../schema'

const lessonStepRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }
    const step = await fastify.data.lessonSteps.get(id)
    if (!step) {
      return reply.code(404).send({ error: 'Lesson step not found' })
    }
    reply.send(step)
  })

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: lessonStepPayloadSchema,
        required: ['title'],
      },
      response: {
        201: lessonStepSchema,
      },
    },
  }, async (request, reply) => {
    // TODO: check role
    const { pathKey, from, to, teaser } = request.body as any
    if (!pathKey) {
      reply.code(400).send('Path key is required')
      return
    }
    if (!from || !to) {
      reply.code(400).send('Step must include from and to')
      return
    }
    const lessonStep = await fastify.data.lessonSteps.create(pathKey, from, to, teaser)
    reply.code(201).send(lessonStep)
  })

  fastify.put('/:id', async (request, reply) => {
    // TODO: check role
    const { id } = request.params as { id: number }
    const { from, to, teaser } = request.body as any
    const lessonStep = await fastify.data.lessonSteps.update(id, from, to, teaser)
    if (!lessonStep) return undefined
    return lessonStep
  })

  fastify.delete('/:id', async (request, reply) => {
    // TODO: check role
    const { id } = request.params as { id: number }
    return await fastify.data.lessonSteps.delete(id)
  })

}

export default lessonStepRoutes