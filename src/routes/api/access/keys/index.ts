import { FastifyPluginAsync } from 'fastify'
import { roleGuard } from '../../../../utils/roleGuard'

const apiKeysRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Generate a new API key for a system user
  fastify.post<{
    Body: { userId: string; description?: string; expiresInDays?: number }
  }>('/', {
    preHandler: roleGuard(['admin']),
    schema: {
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
          description: { type: 'string' },
          expiresInDays: { type: 'number' }
        }
      }
    }
  }, async function (request, reply) {
    const { userId, description, expiresInDays } = request.body

    try {
      // Check if user exists and is a system bot
      const user = await fastify.data.users.getUser(userId)
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      if (!user.system_bot) {
        return reply.status(400).send({ error: 'API keys can only be generated for system users' })
      }

      // Generate expiration date if provided
      let expiresAt = undefined
      if (expiresInDays) {
        expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + expiresInDays)
      }

      // Generate the API key
      const apiKey = await fastify.generateApiKey(userId)

      // Store a hash of the API key in the database
      await fastify.data.users.createApiKey(userId, apiKey, description, expiresAt)

      return { apiKey }
    } catch (error) {
      fastify.log.error(`Error generating API key: ${error}`)
      return reply.status(500).send({ error: 'Failed to generate API key' })
    }
  })

  // List all API keys for a system user
  fastify.get<{
    Querystring: { userId: string }
  }>('/', {
    preHandler: roleGuard(['admin']),
    schema: {
      querystring: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      }
    }
  }, async function (request, reply) {
    const { userId } = request.query

    try {
      const apiKeys = await fastify.data.users.getApiKeys(userId)

      // Don't return the actual key hash for security
      const sanitizedKeys = apiKeys.map(key => ({
        id: key.id,
        description: key.description,
        createdAt: key.created_at,
        lastUsedAt: key.last_used_at,
        expiresAt: key.expires_at
      }))

      return { apiKeys: sanitizedKeys }
    } catch (error) {
      fastify.log.error(`Error listing API keys: ${error}`)
      return reply.status(500).send({ error: 'Failed to list API keys' })
    }
  })

  // Revoke an API key
  fastify.delete<{
    Params: { keyId: string }
  }>('/:keyId', {
    preHandler: roleGuard(['admin']),
    schema: {
      params: {
        type: 'object',
        required: ['keyId'],
        properties: {
          keyId: { type: 'string' }
        }
      }
    }
  }, async function (request, reply) {
    const keyId = parseInt(request.params.keyId, 10)

    if (isNaN(keyId)) {
      return reply.status(400).send({ error: 'Invalid key ID' })
    }

    try {
      const result = await fastify.data.users.revokeApiKey(keyId)
      return { success: true, revokedAt: result?.revoked_at }
    } catch (error) {
      fastify.log.error(`Error revoking API key: ${error}`)
      return reply.status(500).send({ error: 'Failed to revoke API key' })
    }
  })
}

export default apiKeysRoutes