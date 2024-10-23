import { FastifyPluginAsync } from 'fastify'
import fastifyEnv from '@fastify/env'

const envSchema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    NODE_ENV: { type: 'string' },
    LOG_LEVEL: { type: 'string' },
    API_HOST: { type: 'string' },
    API_PORT: { type: 'number' },
    API_URL_BASE: { type: 'string' },
    APP_BASE_URL: { type: 'string' },
    DATABASE_URL: { type: 'string' },
    GITHUB_CLIENT_ID: { type: 'string' },
    GITHUB_CLIENT_SECRET: { type: 'string' },
    GOOGLE_CLIENT_ID: { type: 'string' },
    GOOGLE_CLIENT_SECRET: { type: 'string' },
    X_CLIENT_ID: { type: 'string' },
    X_CLIENT_SECRET: { type: 'string' },
    APPLE_CLIENT_ID: { type: 'string' },
    APPLE_CLIENT_SECRET: { type: 'string' }
  }
}

const envPlugin: FastifyPluginAsync = async (fastify, options) => {
  const envOptions = {
    confKey: 'config',
    schema: envSchema,
    dotenv: true
  }

  await fastify.register(fastifyEnv, envOptions)
}

export default envPlugin
