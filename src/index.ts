import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'
import dotenv from 'dotenv'
import envPlugin from './plugins/env'
import sensiblePlugin from './plugins/sensible'
import examplePlugin from './plugins/example'
import corsPlugin from './plugins/cors'
import cookiePlugin from './plugins/cookie'
import oauth2GithubPlugin from './plugins/oauth2-github'

dotenv.config()

const server = Fastify({
  logger: true
})

// load plugins
server.register(envPlugin)
server.register(sensiblePlugin)
server.register(examplePlugin)
server.register(corsPlugin)
server.register(cookiePlugin)
server.register(oauth2GithubPlugin)

// Autoload routes
server.register(AutoLoad, {
  dir: join(__dirname, 'routes'),
})

server.ready(err => {
  server.log.info('Server ready')
  if (!server.oauth2Github) {
    server.log.warn('oauth2Github plugin not found')
  }
  if (err) throw err
})

const start = async () => {
  server.log.info('start server')
  const host = process.env.API_HOST || 'localhost'
  const port = process.env.API_PORT || 3000
  try {
    await server.listen({ host, port: Number(port) })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()