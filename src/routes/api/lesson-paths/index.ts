import { FastifyPluginAsync } from 'fastify'
import { createLessonPath, deleteLessonPath, getLessonPath, updateLessonPath } from '../../../db/access/lessonPath'

const lessonPathRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await getLessonPath(key)
    if (!plan) {
      reply.code(404).send()
      return
    }
    reply.send(plan)
  })

  type LessonPathPayload = {
    courseKey?: string
    name?: string
    description?: string
    trailhead?: string
  }

  fastify.post('/', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { courseKey, name, description, trailhead } = request.body as LessonPathPayload
    if (!courseKey) {
      reply.code(400).send('Course key is required')
      return
    }
    if (!name) {
      reply.code(400).send('This lesson path needs a name')
      return
    }
    const lessonPath = await createLessonPath(courseKey, name, description, trailhead)
    fastify.log.info(lessonPath)
    reply.code(201).send(lessonPath)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { key } = request.params as { key: string }
    const { name, description, trailhead } = request.body as LessonPathPayload
    const lessonPath = await updateLessonPath(key, name, description, trailhead)
    return lessonPath
  })

  fastify.delete('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await deleteLessonPath(key)
  })

}

export default lessonPathRoutes