import 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    exampleUtil: () => string
    googleOAuth2: FastifyPluginAsync,
    githubOAuth2: FastifyPluginAsync,
    xOAuth2: FastifyPluginAsync,
    config: {
      APP_URL_BASE: string
    }
  }
  interface FastifyRequest {
    db: Kysely<DB>
  }
}