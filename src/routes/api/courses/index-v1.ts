import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import {
  getCourse,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  publish,
  unpublish,
  archive,
  unarchive
} from '../../../db/access/course'
import {
  getLessonPlansForCourse
} from '../../../db/access/lessonPlan'
import { getLessonPathsForCourse } from '../../../db/access/lessonPath'

const verifyEditorRole = () => {
  return false
}

const courseBodySchema = {
  type: 'object',
  required: [],
  properties: {
    publicKey: {
      type: "string"
    },

  }
}

const courseRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  fastify.get('/v1/', async (request, reply) => {
    return await getCourses()
  })

  type CoursePayload = {
    title?: string
    description?: string
    syllabus?: string | undefined
    teaser?: string | undefined
    coverArt?: string | undefined
  }

  fastify.post('/v1/', async (request, reply) => {
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
    fastify.log.info(course)
    reply.code(201).send(course)
  })

  fastify.get('/v1/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    const course = await getCourse(key)
    if (!course) {
      reply.code(404).send()
      return
    }
    reply.send(course)
  })

  fastify.put('/v1/:key', async (request, reply) => {
    // TODO: check role
    // if (!request.session?.userId) {
    //   fastify.log.warn(`Only content editors may create courses`)
    //   return reply.status(401).send({ error: 'Unauthorized' })
    // }

    const { key } = request.params as { key: string }
    const { title, description, syllabus, teaser, coverArt } = request.body as CoursePayload
    const course = await updateCourse(key, title, description, syllabus, teaser, coverArt)
    return course
  })

  fastify.delete('/v1/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await deleteCourse(key)
  })

  fastify.put('/v1/:key/publish', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await publish(key)
  })

  fastify.put('/v1/:key/unpublish', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await unpublish(key)
  })

  fastify.put('/v1/:key/archive', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await archive(key)
  })

  fastify.put('/v1/:key/unarchive', async (request, reply) => {
    const { key } = request.params as { key: string }
    return await unarchive(key)
  })

  fastify.get('/v1/:key/lesson-plans', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await getLessonPlansForCourse(key)
    reply.send(plans)
  })

  fastify.get('/v1/:key/lesson-paths', async (request, reply) => {
    const { key } = request.params as { key: string }
    const plans = await getLessonPathsForCourse(key)
    reply.send(plans)
  })

}

export default courseRoutes
