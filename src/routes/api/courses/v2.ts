import { FastifyInstance, FastifyPluginAsync } from 'fastify'

const courseRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  type CoursePayload = {
    title?: string
    description?: string
    syllabus?: string | undefined
    teaser?: string | undefined
    coverArt?: string | undefined
  }

  fastify.get('/', async (request, reply) => {
    return await fastify.data.courses.getCourses()
  })

  fastify.get('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await fastify.data.courses.getCourse(key)
    if (!course) {
      return reply.code(404).send({ error: 'Course not found' })
    }
    reply.send(course)
  })

  fastify.post('/', async (request, reply) => {
    // TODO: check role - only author role

    const { title, description, syllabus, teaser, coverArt } = request.body as CoursePayload
    if (!title) {
      reply.code(400).send('Title is required')
      return
    }
    const course = await fastify.data.courses.createCourse(title, description, syllabus, teaser, coverArt)

    reply.code(201).send(course)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role

    const { key } = request.params as { key: string }
    const { title, description, syllabus, teaser, coverArt } = request.body as CoursePayload
    const course = await fastify.data.courses.updateCourse(key, title, description, syllabus, teaser, coverArt)
    reply.send(course)
  })

  fastify.put('/:key/publish', async (request, reply) => {
    const { key } = request.params as { key: string }
    const result = await fastify.data.courses.publish(key)
    reply.send(result)
  })

  fastify.put('/:key/unpublish', async (request, reply) => {
    const { key } = request.params as { key: string }
    const result = await fastify.data.courses.unpublish(key)
    reply.send(result)
  })

  fastify.put('/:key/archive', async (request, reply) => {
    const { key } = request.params as { key: string }
    const result = await fastify.data.courses.archive(key)
    reply.send(result)
  })

  fastify.put('/:key/unarchive', async (request, reply) => {
    const { key } = request.params as { key: string }
    const result = await fastify.data.courses.unarchive(key)
    reply.send(result)
  })

  fastify.delete('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    await fastify.data.courses.deleteCourse(key)
    reply.code(204).send()
  })

}

export default courseRoutes
