import 'fastify'
import { Session } from './session'

declare module 'fastify' {
  interface FastifyInstance {
    exampleUtil: () => string
    session: Session | null
    googleOAuth2: FastifyPluginAsync
    githubOAuth2: FastifyPluginAsync
    xOAuth2: FastifyPluginAsync
    config: {
      APP_URL_BASE: string
      JWT_SECRET_KEY: string
    }
  }
  interface FastifyRequest {
    db: Kysely<DB>
    session: Session | null
  }
}