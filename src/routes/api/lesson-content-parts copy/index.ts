import { FastifyPluginAsync } from 'fastify'
import { getContentPart, createContentPart, updateContentPart, deleteContentPart } from '../../../db/access/contentPart'

const lessonContentPartRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await getContentPart(key)
    if (!plan) {
      reply.code(404).send()
      return
    }
    reply.send(plan)
  })

  type ContentPartPayload = {
    lessonKey?: string
    contentPartType?: string
    content?: string
    sequence?: number | undefined
  }

  fastify.post('/', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { lessonKey, contentPartType, content, sequence } = request.body as ContentPartPayload
    if (!lessonKey) {
      reply.code(400).send('Lesson key is required')
      return
    }
    if (!contentPartType) {
      reply.code(400).send('Type of content is required')
      return
    }
    const contentPart = await createContentPart(lessonKey, contentPartType, content, sequence)
    fastify.log.info(contentPart)
    reply.code(201).send(contentPart)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { key } = request.params as { key: string }
    const { content, sequence } = request.body as ContentPartPayload
    const contentPart = await updateContentPart(key, content, sequence)
    return contentPart
  })

  fastify.delete('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await deleteContentPart(key)
  })

}

export default lessonContentPartRoutes