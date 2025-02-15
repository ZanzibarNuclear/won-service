import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { AuthRepository } from '../db/access/authRepo'
import { CourseRepository } from '../db/access/courseRepo'
import { EventRepository } from '../db/access/eventRepo'
import { FeedbackRepository } from '../db/access/feedbackRepo'
import { FluxRepository } from '../db/access/fluxRepo'
import { LessonContentPartRepository } from '../db/access/contentPartRepo'
import { LessonPathRepository } from '../db/access/lessonPathRepo'
import { LessonPlanRepository } from '../db/access/lessonPlanRepo'
import { LessonStepRepository } from '../db/access/lessonStepRepo'
import { UserRepository } from '../db/access/userRepo'

const dataAccessPlugin: FastifyPluginAsync = async (fastify, options) => {
  const data = {
    auth: new AuthRepository(fastify.db),
    courses: new CourseRepository(fastify.db),
    events: new EventRepository(fastify.db),
    feedback: new FeedbackRepository(fastify.db),
    flux: new FluxRepository(fastify.db),
    lessonPlans: new LessonPlanRepository(fastify.db),
    lessonContents: new LessonContentPartRepository(fastify.db),
    lessonPaths: new LessonPathRepository(fastify.db),
    lessonSteps: new LessonStepRepository(fastify.db),
    users: new UserRepository(fastify.db)
  }
  fastify.decorate('data', data)
  fastify.log.info('registered dataAccess plugin')
}

export default fp(dataAccessPlugin, { name: 'dataAccess', dependencies: ['db'] })
