import 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    exampleUtil: () => string
  }
  interface FastifyRequest {
    db: Kysely<DB>
  }
}