import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const server = Fastify({
  logger: true
})

// Autoload plugins
server.register(AutoLoad, {
  dir: join(__dirname, 'plugins'),
  autoHooks: true,
  logLevel: 'debug',
  cascadeHooks: true,
})

// Autoload routes
server.register(AutoLoad, {
  dir: join(__dirname, 'routes'),
})

server.ready(err => {
  server.log.info('Server ready')
  server.log.info('proof of env: ' + process.env.DATABASE_URL)
  server.log.info('proof of env: ' + process.env.API_PORT)
  server.log.info('proof of env: ' + process.env.API_URL_BASE)
  if (err) throw err
})

const start = async () => {
  server.log.info('start server')
  server.log.info('proof of env: ' + process.env.API_PORT)
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