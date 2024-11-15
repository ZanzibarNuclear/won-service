import 'fastify'
import { Session } from './session'

declare module 'fastify' {
  interface FastifyInstance {
    session: Session | null
    generateSessionToken: (sessionData: Session) => string
    setSessionToken: (reply: FastifyReply, token: string) => void
    removeSessionToken: (reply: FastifyReply) => void
    db: Kysely<DB>
    resend: Resend
    sendEmail: (from: string, to: string, subject: string, htmlBody: string) => Promise<EmailResponse>
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