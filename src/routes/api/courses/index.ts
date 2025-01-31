import { FastifyPluginAsync } from 'fastify'
import {
  getCourse,
  getCourses,
  createCourse,
  updateCourse,
} from '../../../db/access/course'

const verifyEditorRole = () => {
  return false
}

const courseRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/', async (request, reply) => {
    return await getCourses()
  })

  type CoursePayload = {
    title?: string
    description?: string
    syllabus?: string | undefined
    teaser?: string | undefined
    coverArt?: string | undefined
  }

  fastify.post('/', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { title, description, syllabus, teaser, coverArt } = request.body as CoursePayload
    if (!title) {
      reply.code(400).send('Title is required')
      return
    }
    const course = await createCourse(title, description, syllabus, teaser, coverArt)
    reply.code(201).send(course)
  })

  fastify.get('/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await getCourse(key)
  })

  fastify.put('/:key', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { key } = request.params as { key: string }
    const { title, description, syllabus, teaser, coverArt } = request.body as CoursePayload
    const flux = await updateCourse(key, title, description, syllabus, teaser, coverArt)
    return flux
  })

}

export default courseRoutes
