import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'
import dotenv from 'dotenv'
import envPlugin from './plugins/env'
import sensiblePlugin from './plugins/sensible'
import corsPlugin from './plugins/cors'
import cookiePlugin from './plugins/cookie'
import oauth2Plugin from './plugins/oauth2'
import sessionAuthPlugin from './plugins/sessionAuth'

dotenv.config()

const fastify = Fastify({
  logger: true
})

// const loadPlugins = async () => {
//   await fastify.register(require('fastify-overview'))
//   await fastify.register(envPlugin)
//   await fastify.register(corsPlugin)
//   await fastify.register(cookiePlugin)
//   await fastify.register(sensiblePlugin)
//   await fastify.register(sessionAuthPlugin)
//   await fastify.register(oauth2Plugin)
// }

// loadPlugins()

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

fastify.ready(err => {
  fastify.log.info('Server ready')
  if (err) throw err
})

const start = async () => {
  fastify.log.info('start server')
  const host = process.env.API_HOST
  const port = process.env.API_PORT
  if (!host || !port) {
    throw new Error('API_HOST or API_PORT is not set')
  }
  try {
    await fastify.listen({ host, port: Number(port) })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()