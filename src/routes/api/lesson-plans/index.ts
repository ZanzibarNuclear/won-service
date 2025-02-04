import { FastifyPluginAsync } from 'fastify'
import { createLessonPlan, deleteLessonPlan, getLessonPlan, updateLessonPlan, publish, unpublish, archive, unarchive } from '../../../db/access/lessonPlan'
import { getContentPartsForLessonPlan } from '../../../db/access/contentPart'

const lessonPlanRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await getLessonPlan(key)
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

  fastify.post('/', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { courseKey, title, description, objective, sequence, coverArt } = request.body as LessonPlanPayload
    if (!title) {
      reply.code(400).send('Title is required')
      return
    }
    const plan = await createLessonPlan(courseKey, title, description, objective, sequence, coverArt)
    fastify.log.info(plan)
    reply.code(201).send(plan)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { key } = request.params as { key: string }
    const { title, description, objective, sequence, coverArt } = request.body as LessonPlanPayload
    const plan = await updateLessonPlan(key, title, description, objective, sequence, coverArt)
    return plan
  })

  fastify.delete('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await deleteLessonPlan(key)
  })

  // TODO: add error handling for 404 -- for all learning resources

  fastify.put('/:key/publish', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await publish(key)
  })

  fastify.put('/:key/unpublish', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await unpublish(key)
  })

  fastify.put('/:key/archive', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await archive(key)
  })

  fastify.put('/:key/unarchive', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await unarchive(key)
  })

  fastify.get('/:key/content-parts', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await getContentPartsForLessonPlan(key)
    reply.send(plans)
  })

}

export default lessonPlanRoutes