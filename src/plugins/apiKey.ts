import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import crypto from 'crypto'

interface ApiKeyPluginOptions {
  apiKeySecret: string
}

const apiKeyPlugin: FastifyPluginAsync<ApiKeyPluginOptions> = async (fastify, options) => {
  // Add API key related methods to the fastify instance
  fastify.decorate('generateApiKey', generateApiKey)
  fastify.decorate('verifyApiKey', verifyApiKey)

  // TODO: add logic to session plugin to verify API Key when used -- or maybe it was fine

  // Add a hook to check for API key in the Authorization header
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip if session is already set by the session plugin
    if (request.session) {
      fastify.log.debug('apiKey plug-in: Creds already established')
      return
    }

    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      fastify.log.debug('apiKey plug-in: no app key')
      return
    }

    const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
    try {
      const userId = await verifyApiKey(apiKey, fastify.config.JWT_SECRET_KEY)
      const user: any = await fastify.data.users.getUser(userId)

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.systemBot) {
        throw new Error('API key authentication is only for system users')
      }

      fastify.log.info('We have a system user')
      const credentials = await fastify.data.users.getCreds(userId)
      const sessionData = {
        userId: credentials.sub,
        alias: credentials.name,
        roles: credentials.role
      }

      request.session = sessionData
      request.userId = credentials.sub

    } catch (error) {
      fastify.log.error(`API key authentication failed: ${error}`)
      // Don't send an error response here to allow other auth methods to try
    }
  })

  // Function to generate a new API key for a system user
  async function generateApiKey(userId: string): Promise<string> {
    // Generate a random key part to make the API key unique
    const randomPart = crypto.randomBytes(16).toString('hex')

    // Create a payload with user ID and random part
    const payload = {
      sub: userId,
      key: randomPart
    }

    // Sign the payload with the JWT secret
    const token = crypto.createHmac('sha256', fastify.config.JWT_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex')

    // Combine the user ID, random part, and token to form the API key
    return `${userId}.${randomPart}.${token}`
  }

  // Function to verify an API key
  async function verifyApiKey(apiKey: string, secret: string): Promise<string> {
    const parts = apiKey.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid API key format')
    }

    const [userId, randomPart, providedToken] = parts

    // Recreate the payload
    const payload = {
      sub: userId,
      key: randomPart
    }

    // Recalculate the token
    const expectedToken = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    // Verify that the tokens match
    if (providedToken !== expectedToken) {
      throw new Error('Invalid API key')
    }

    return userId
  }

  if (!fastify.config.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not set')
  }

  fastify.log.info('registered api key plugin')
}

export default fp(apiKeyPlugin, { name: 'apiKey', dependencies: ['env', 'dataAccess'] })