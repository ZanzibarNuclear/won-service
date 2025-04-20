import 'fastify'
import { UserCredentials } from './won-flux-types'
import { AuthRepository } from '../db/access/authRepo'
import { CourseRepository } from '../db/access/courseRepo'
import { EventRepository } from '../db/access/eventRepo'
import { FeedbackRepository } from '../db/access/feedbackRepo'
import { FluxRepository } from '../db/access/fluxRepo'
import { LessonContentPartRepository } from './../db/access/contentPartRepo';
import { LessonPathRepository } from '../db/access/lessonPathRepo'
import { LessonPlanRepository } from '../db/access/lessonPlanRepo'
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
      userProfiles: UserProfileRepository
      users: UserRepository
    }
    sendMagicLink: (email: string) => void
    session: UserCredentials | null
    profileImagePath: string
    generateSessionToken: (sessionData: UserCredentials) => string
    setSessionToken: (reply: FastifyReply, token: string) => void
    removeSessionToken: (reply: FastifyReply) => void
    resendAuth: Resend
    resendFeedback: Resend
    sendAuthEmail: (from: string, to: string, subject: string, htmlBody: string) => Promise<EmailResponse>
    sendFeedbackEmail: (from: string, to: string, subject: string, htmlBody: string) => Promise<EmailResponse>
    validateTurnstile: (turnstileToken: string, ipAddress: string) => Promise<{ success: boolean }>
    googleOAuth2: FastifyPluginAsync
    githubOAuth2: FastifyPluginAsync
    discordOAuth2: FastifyPluginAsync
    xOAuth2: FastifyPluginAsync
    appleOAuth2: FastifyPluginAsync
    spotifyOAuth2: FastifyPluginAsync
    metaOAuth2: FastifyPluginAsync
    config: {
      PORT: number
      NODE_ENV: string
      LOG_LEVEL: string
      API_HOST: string
      API_PORT: string
      API_BASE_URL: string
      ALT_BASE_URL: string
      APP_BASE_URL: string
      DATABASE_URL: string
      JWT_SECRET_KEY: string
      COOKIE_DOMAIN: string
      COOKIE_SECRET: string
      RESEND_AUTH_KEY: string
      RESEND_FEEDBACK_KEY: string
      ADMIN_EMAIL: string
      IMAGE_STORAGE_PATH: string
      IMAGE_ACCESS_ROOT: string
      TURNSTILE_SECRET_KEY: string
      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      DISCORD_CLIENT_ID: string
      DISCORD_CLIENT_SECRET: string
      // FACEBOOK_CLIENT_ID: string
      // FACEBOOK_CLIENT_SECRET: string
      // X_CLIENT_ID: string
      // X_CLIENT_SECRET: string
      // APPLE_CLIENT_ID: string
      // APPLE_CLIENT_SECRET: string
      // SPOTIFY_CLIENT_ID: string
      // SPOTIFY_CLIENT_SECRET: string
    }
  }
  interface FastifyRequest {
    session: Session | null
  }
}