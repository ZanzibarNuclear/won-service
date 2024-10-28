import 'fastify'
import { Session } from './session'

declare module 'fastify' {
  interface FastifyInstance {
    session: Session | null
    setSessionToken: (reply: FastifyReply, token: string) => void
    generateSessionToken: (sessionData: Session) => string
    googleOAuth2: FastifyPluginAsync
    githubOAuth2: FastifyPluginAsync
    xOAuth2: FastifyPluginAsync
    config: {
      API_HOST: string
      API_PORT: string
      APP_BASE_URL: string
      API_BASE_URL: string
      JWT_SECRET_KEY: string
      COOKIE_SECRET: string
      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      X_CLIENT_ID: string
      X_CLIENT_SECRET: string
      APPLE_CLIENT_ID: string
      APPLE_CLIENT_SECRET: string
    }
  }
  interface FastifyRequest {
    db: Kysely<DB>
    session: Session | null
  }
}