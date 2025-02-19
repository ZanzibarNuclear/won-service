import fp from 'fastify-plugin'
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
    API_BASE_URL: { type: 'string' },
    APP_BASE_URL: { type: 'string' },
    DATABASE_URL: { type: 'string' },
    JWT_SECRET_KEY: { type: 'string' },
    COOKIE_DOMAIN: { type: 'string' },
    COOKIE_SECRET: { type: 'string' },
    RESEND_API_KEY: { type: 'string' },
    RESEND_FEEDBACK_KEY: { type: 'string' },
    ADMIN_EMAIL: { type: 'string' },
    TURNSTILE_SECRET_KEY: { type: 'string' },
    GITHUB_CLIENT_ID: { type: 'string' },
    GITHUB_CLIENT_SECRET: { type: 'string' },
    GOOGLE_CLIENT_ID: { type: 'string' },
    GOOGLE_CLIENT_SECRET: { type: 'string' },
    X_CLIENT_ID: { type: 'string' },
    X_CLIENT_SECRET: { type: 'string' },
  }
}

const envPlugin: FastifyPluginAsync = async (fastify, options) => {
  const envOptions = {
    confKey: 'config',
    schema: envSchema,
    dotenv: true
  }
  await fastify.register(fastifyEnv, envOptions)
  fastify.log.info('registered env plugin')
}

export default fp(envPlugin, { name: 'env' })
