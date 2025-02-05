import 'fastify'
import { Session } from './won-flux-types'
import { CourseRepository } from '../db/access/courseRepo'
import { LessonPlanRepository } from '../db/access/lessonPlanRepo'

declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<DB>
    data: {
      courses: CourseRepository
      lessonPlans: LessonPlanRepository
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