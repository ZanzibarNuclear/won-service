import Fastify from 'fastify'
import AutoLoad from '@fastify/autoload'
import { join } from 'path'

const server = Fastify({
  logger: true
})

// Autoload plugins
server.register(AutoLoad, {
  dir: join(__dirname, 'plugins'),
  options: { /* optional options */ }
})

// Autoload routes
server.register(AutoLoad, {
  dir: join(__dirname, 'routes'),
  options: { /* optional options */ }
})

const start = async () => {
  try {
    await server.listen({ port: 3000 })
    console.log(`Server listening on http://localhost:3000`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()