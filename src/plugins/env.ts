import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import fastifyEnv from '@fastify/env'
import { validateSecretKeyStrength } from '../utils/validateSecretKey'

const envSchema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    PORT: { type: 'number' },
    NODE_ENV: { type: 'string' },
    LOG_LEVEL: { type: 'string' },
    API_HOST: { type: 'string' },
    API_PORT: { type: 'number' },
    API_BASE_URL: { type: 'string' },
    ALT_BASE_URL: { type: 'string' },
    APP_BASE_URL: { type: 'string' },
    DATABASE_URL: { type: 'string' },
    JWT_SECRET_KEY: { type: 'string' },
    COOKIE_DOMAIN: { type: 'string' },
    COOKIE_SECRET: { type: 'string' },
    RESEND_AUTH_KEY: { type: 'string' },
    RESEND_FEEDBACK_KEY: { type: 'string' },
    ADMIN_EMAIL: { type: 'string' },
    MEMBER_IMAGE_FILE_PATH: { type: 'string' },
    MEMBER_IMAGE_VIEW_PATH: { type: 'string' },
    TURNSTILE_SECRET_KEY: { type: 'string' },
    GITHUB_CLIENT_ID: { type: 'string' },
    GITHUB_CLIENT_SECRET: { type: 'string' },
    GOOGLE_CLIENT_ID: { type: 'string' },
    GOOGLE_CLIENT_SECRET: { type: 'string' },
    DISCORD_CLIENT_ID: { type: 'string' },
    DISCORD_CLIENT_SECRET: { type: 'string' },
    // FACEBOOK_CLIENT_ID: { type: 'string' },
    // FACEBOOK_CLIENT_SECRET: { type: 'string' },
    // X_CLIENT_ID: { type: 'string' },
    // X_CLIENT_SECRET: { type: 'string' },
    // APPLE_CLIENT_ID: { type: 'string' },
    // APPLE_CLIENT_SECRET: { type: 'string' },
    // SPOTIFY_CLIENT_ID: { type: 'string' },
    // SPOTIFY_CLIENT_SECRET: { type: 'string' },
  }
}

/**
 * Validates security-critical environment variables
 * @param fastify - Fastify instance
 */
function validateSecurityEnvVars(fastify: any) {
  // Skip validation in test environment
  if (fastify.config.NODE_ENV === 'test') {
    return;
  }

  // Validate JWT secret key if present
  if (fastify.config.JWT_SECRET_KEY) {
    // Use stricter validation in production
    const options = fastify.config.NODE_ENV === 'production'
      ? { minLength: 48 } // Stricter for production
      : { minLength: 32 }; // More lenient for development

    const validation = validateSecretKeyStrength(fastify.config.JWT_SECRET_KEY, options);

    if (!validation.isValid) {
      // In production, throw an error to prevent startup with weak secrets
      if (fastify.config.NODE_ENV === 'production') {
        throw new Error(`Invalid JWT_SECRET_KEY: ${validation.reason}`);
      } else {
        // In development, log a warning but allow startup
        fastify.log.warn(`WARNING: JWT_SECRET_KEY is weak: ${validation.reason}`);
      }
    }
  } else if (fastify.config.NODE_ENV === 'production') {
    // In production, JWT_SECRET_KEY should be required
    throw new Error('JWT_SECRET_KEY is required in production environment');
  }

  // Similar validation could be added for other security-critical env vars
  // like COOKIE_SECRET, API keys, etc.
}

const envPlugin: FastifyPluginAsync = async (fastify, options) => {
  const envOptions = {
    confKey: 'config',
    schema: envSchema,
    dotenv: true
  }
  await fastify.register(fastifyEnv, envOptions)

  // Validate security-critical environment variables
  validateSecurityEnvVars(fastify);

  fastify.log.info('registered env plugin')
}

export default fp(envPlugin, { name: 'env' })
