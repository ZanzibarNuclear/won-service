import 'fastify'
import { Session } from './session'

declare module 'fastify' {
  interface FastifyInstance {
    session: Session | null
    googleOAuth2: FastifyPluginAsync
    githubOAuth2: FastifyPluginAsync
    xOAuth2: FastifyPluginAsync
    config: {
      API_HOST: string
      API_PORT: string
      APP_URL_BASE: string
      JWT_SECRET_KEY: string
      COOKIE_SECRET: string
    }
  }
  interface FastifyRequest {
    db: Kysely<DB>
    session: Session | null
  }
}