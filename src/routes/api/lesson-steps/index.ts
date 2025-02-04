import { FastifyPluginAsync } from 'fastify'
import { createLessonStep, getLessonStep, updateLessonStep, deleteLessonStep } from '../../../db/access/lessonStep'

const lessonStepRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }
    const plan = await getLessonStep(id)
    if (!plan) {
      reply.code(404).send()
      return
    }
    reply.send(plan)
  })

  type LessonStepPayload = {
    pathKey?: string
    from?: string
    to?: string
    teaser?: string
  }

  fastify.post('/', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { pathKey, from, to, teaser } = request.body as LessonStepPayload
    if (!pathKey) {
      reply.code(400).send('Path key is required')
      return
    }
    if (!from || !to) {
      reply.code(400).send('Step must include from and to')
      return
    }
    const lessonStep = await createLessonStep(pathKey, from, to, teaser)
    reply.code(201).send(lessonStep)
  })

  fastify.put('/:id', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { id } = request.params as { id: number }
    const { from, to, teaser } = request.body as LessonStepPayload
    const lessonPath = await updateLessonStep(id, from, to, teaser)
    return lessonPath
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }
    return await deleteLessonStep(id)
  })

}

export default lessonStepRoutes