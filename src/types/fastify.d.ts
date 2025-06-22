import 'fastify'
import { UserCredentials } from './won-flux-types'
import { AuthRepository } from '../db/access/authRepo'
import { CourseRepository } from '../db/access/courseRepo'
import { EventRepository } from '../db/access/eventRepo'
import { FeedbackRepository } from '../db/access/feedbackRepo'
import { FlagRepository } from '../db/access/flagRepo'
import { FluxRatingRepository } from '../db/access/fluxRatingRepo'
import { FluxRepository } from '../db/access/fluxRepo'
import { LessonContentPartRepository } from './../db/access/contentPartRepo';
import { LessonPathRepository } from '../db/access/lessonPathRepo'
import { LessonPlanRepository } from '../db/access/lessonPlanRepo'
import { LessonStepRepository } from '../db/access/lessonStepRepo'
import { PublicProfileRepository } from '../db/access/profileRepo'
import { Session } from '../types/won-flux-types'
import { UserProfileRepository } from '../db/access/userProfileRepo'
import { UserRepository } from '../db/access/userRepo'
import { Collection } from '@fastify/mongodb'
import { Campaign, Player, Item, Zone, Room, Npc, Event, Storyline } from '../models'

declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<DB>
    data: {
      auth: AuthRepository
      courses: CourseRepository
      events: EventRepository
      feedback: FeedbackRepository
      flags: FlagRepository
      flux: FluxRepository
      fluxRating: FluxRatingRepository
      lessonPlans: LessonPlanRepository
      lessonContents: LessonContentPartRepository
      lessonPaths: LessonPathRepository
      lessonSteps: LessonStepRepository
      publicProfiles: PublicProfileRepository
      userProfiles: UserProfileRepository
      users: UserRepository
    }
    mongoCollections: {
      storylines: Collection<Storyline>
      campaigns: Collection<Campaign>
      players: Collection<Player>
      zones: Collection<Zone>
      rooms: Collection<Room>
      items: Collection<Item>
      npcs: Collection<Npc>
      events: Collection<Event>
    }
    sendMagicLink: (email: string) => void
    session: UserCredentials | null
    memberImageFilePath: string
    memberImageViewPath: string
    generateSessionToken: (sessionData: UserCredentials) => string
    setSessionToken: (reply: FastifyReply, token: string) => void
    removeSessionToken: (reply: FastifyReply) => void
    generateApiKey: (userId: string) => Promise<string>
    verifyApiKey: (apiKey: string, secret: string) => Promise<string>
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
      MONGO_URI: string
      JWT_SECRET_KEY: string
      COOKIE_DOMAIN: string
      COOKIE_SECRET: string
      RESEND_AUTH_KEY: string
      RESEND_FEEDBACK_KEY: string
      ADMIN_EMAIL: string
      MEMBER_IMAGE_FILE_PATH: string
      MEMBER_IMAGE_VIEW_PATH: string
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
    userId: string | null
  }
}