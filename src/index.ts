import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const fastify = Fastify({
  logger: true
})

// Autoload plugins
fastify.register(AutoLoad, {
  dir: join(__dirname, 'plugins'),
})

// Autoload routes
fastify.register(AutoLoad, {
  dir: join(__dirname, 'routes'),
})

fastify.addHook('onRequest', (request, reply, done) => {
  console.log('Incoming request:', {
    method: request.method,
    url: request.url,
    headers: request.headers,
  })
  done()
})

const start = async () => {
  fastify.log.info('starting server')
  try {
    await fastify.ready()
    const host = fastify.config.API_HOST
    const port = fastify.config.API_PORT
    if (!host || !port) {
      throw new Error('API_HOST or API_PORT is not set')
    }
    console.log('\n' + fastify.printRoutes())
    await fastify.listen({ host, port: Number(port) })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()