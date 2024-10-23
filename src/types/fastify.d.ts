import 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    exampleUtil: () => string
    googleOAuth2: FastifyPluginAsync,
    githubOAuth2: FastifyPluginAsync,
    xOAuth2: FastifyPluginAsync,
  }
  interface FastifyRequest {
    db: Kysely<DB>
  }
}