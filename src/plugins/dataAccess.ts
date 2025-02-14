import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { AuthRepository } from '../db/access/authRepo'
import { CourseRepository } from '../db/access/courseRepo'
import { LessonPlanRepository } from '../db/access/lessonPlanRepo'
import { LessonPathRepository } from '../db/access/lessonPathRepo'
import { LessonStepRepository } from '../db/access/lessonStepRepo'
import { LessonContentPartRepository } from '../db/access/contentPartRepo'

const dataAccessPlugin: FastifyPluginAsync = async (fastify, options) => {
  const data = {
    auth: new AuthRepository(fastify.db),
    courses: new CourseRepository(fastify.db),
    lessonPlans: new LessonPlanRepository(fastify.db),
    lessonContents: new LessonContentPartRepository(fastify.db),
    lessonPaths: new LessonPathRepository(fastify.db),
    lessonSteps: new LessonStepRepository(fastify.db)
  }
  fastify.decorate('data', data)
  fastify.log.info('registered dataAccess plugin')
}

export default fp(dataAccessPlugin, { name: 'dataAccess', dependencies: ['db'] })
