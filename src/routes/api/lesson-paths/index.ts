import { FastifyPluginAsync } from 'fastify'

const lessonPathRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plan = await fastify.data.lessonPaths.get(key)
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
    const { courseKey, name, description, trailhead } = request.body as LessonPathPayload
    if (!courseKey) {
      reply.code(400).send('Course key is required')
      return
    }
    if (!name) {
      reply.code(400).send('This lesson path needs a name')
      return
    }
    const lessonPath = await fastify.data.lessonPaths.create(courseKey, name, description, trailhead)
    fastify.log.info(lessonPath)
    reply.code(201).send(lessonPath)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role
    const { key } = request.params as { key: string }
    const { name, description, trailhead } = request.body as LessonPathPayload
    const lessonPath = await fastify.data.lessonPaths.update(key, name, description, trailhead)
    return lessonPath
  })

  fastify.delete('/:key', async (request, reply) => {
    // TODO: check role
    const { key } = request.params as { key: string }
    return await fastify.data.lessonPaths.delete(key)
  })

  fastify.get('/:key/lesson-steps', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await fastify.data.lessonSteps.findByPath(key)
    reply.send(plans)
  })

}

export default lessonPathRoutes