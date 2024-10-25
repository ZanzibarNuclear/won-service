import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'
import dotenv from 'dotenv'
import envPlugin from './plugins/env'
import sensiblePlugin from './plugins/sensible'
import examplePlugin from './plugins/example'
import corsPlugin from './plugins/cors'
import cookiePlugin from './plugins/cookie'
import oauth2Plugin from './plugins/oauth2'
import sessionAuthPlugin from './plugins/sessionAuth'

dotenv.config()

const server = Fastify({
  logger: true
})

const loadPlugins = async () => {
  await server.register(envPlugin)
  await server.register(corsPlugin)
  await server.register(cookiePlugin)
  await server.register(sensiblePlugin)
  await server.register(examplePlugin)
  await server.register(oauth2Plugin)
  await server.register(sessionAuthPlugin)
}

loadPlugins()

// Autoload routes
server.register(AutoLoad, {
  dir: join(__dirname, 'routes'),
})

server.addHook('onRequest', (request, reply, done) => {
  console.log('Incoming request:', {
    method: request.method,
    url: request.url,
    headers: request.headers,
  })
  done()
})

server.ready(err => {
  server.log.info('Server ready')
  if (err) throw err
})

const start = async () => {
  server.log.info('start server')
  const host = process.env.API_HOST
  const port = process.env.API_PORT
  if (!host || !port) {
    throw new Error('API_HOST or API_PORT is not set')
  }
  try {
    await server.listen({ host, port: Number(port) })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()