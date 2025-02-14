import 'fastify'
import { Session } from './won-flux-types'
import { AuthRepository } from '../db/access/authRepo'
import { CourseRepository } from '../db/access/courseRepo'
import { EventRepository } from '../db/access/eventRepo'
import { FeedbackRepository } from '../db/access/feedbackRepo'
import { FluxRepository } from '../db/access/fluxRepo'
import { LessonPlanRepository } from '../db/access/lessonPlanRepo'
import { LessonContentPartRepository } from './../db/access/contentPartRepo';
import { LessonPathRepository } from '../db/access/lessonPathRepo'
import { LessonStepRepository } from '../db/access/lessonStepRepo'
import { UserRepository } from '../db/access/userRepo'

declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<DB>
    data: {
      auth: AuthRepository
      courses: CourseRepository
      events: EventRepository
      feedback: FeedbackRepository
      flux: FluxRepository
      lessonPlans: LessonPlanRepository
      lessonContents: LessonContentPartRepository
      lessonPaths: LessonPathRepository
      lessonSteps: LessonStepRepository
      users: UserRepository
    }
    session: Session | null
    generateSessionToken: (sessionData: Session) => string
    setSessionToken: (reply: FastifyReply, token: string) => void
    removeSessionToken: (reply: FastifyReply) => void
    resend: Resend
    sendEmail: (from: string, to: string, subject: string, htmlBody: string) => Promise<EmailResponse>
    validateTurnstile: (turnstileToken: string, ipAddress: string) => Promise<{ success: boolean }>
    googleOAuth2: FastifyPluginAsync
    githubOAuth2: FastifyPluginAsync
    xOAuth2: FastifyPluginAsync
    config: {
      NODE_ENV: string
      API_HOST: string
      API_PORT: string
      APP_BASE_URL: string
      API_BASE_URL: string
      JWT_SECRET_KEY: string
      COOKIE_DOMAIN: string
      COOKIE_SECRET: string
      RESEND_API_KEY: string
      TURNSTILE_SECRET_KEY: string
      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      X_CLIENT_ID: string
      X_CLIENT_SECRET: string
    }
  }
  interface FastifyRequest {
    session: Session | null
  }
}