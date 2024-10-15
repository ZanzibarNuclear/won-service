import 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    exampleUtil: () => string
  }
}
