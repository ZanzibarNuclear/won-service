import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { CourseRepository } from '../db/access/courseRepo'
import { LessonPlanRepository } from '../db/access/lessonPlanRepo'

const dataAccessPlugin: FastifyPluginAsync = async (fastify, options) => {
  const data = {
    courses: new CourseRepository(fastify.db),
    lessonPlans: new LessonPlanRepository(fastify.db)
  }
  fastify.decorate('data', data)
  fastify.log.info('registered dataAccess plugin')
}

export default fp(dataAccessPlugin, { name: 'dataAccess', dependencies: ['db'] })
