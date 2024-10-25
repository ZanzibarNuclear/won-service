import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import jwt from 'jsonwebtoken'
import { db } from '../db/Database'
import type { Session } from '../types/session'

interface SessionAuthPluginOptions {
  sessionSecret: string
}

const sessionAuthPlugin: FastifyPluginAsync<SessionAuthPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('session', null)

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = request.cookies['session_token']
    if (!sessionToken) {
      return
    }

    // TODO: remove...
    fastify.log.info(`JWT secret key: ${fastify.config.JWT_SECRET_KEY}`)
    try {
      const session = await verifySessionToken(sessionToken, fastify.config.JWT_SECRET_KEY)
      request.session = session
    } catch (error) {
      if (!fastify.config.JWT_SECRET_KEY) {
        fastify.log.error('Cannot verify session tokens. JWT_SECRET_KEY is not set.')
      }
      fastify.log.error(`Failed to verify session token: ${error}`)
      reply.clearCookie('session_token')
    }
  })
}

async function verifySessionToken(token: string, secret: string): Promise<Session> {
  // Implement your token verification logic here
  // This could involve JWT verification, database lookup, etc.

  // TODO: decode token
  const decoded = jwt.verify(token, secret)
  const { userId } = decoded as Session

  // TODO: look up session in database; need to store it somewhere
  const user = await db.selectFrom('users').select(['id', 'alias']).where('id', '=', userId).executeTakeFirst()
  if (!user) {
    throw new Error('User not found')
  }

  return {
    userId,
    alias: user.alias,
    roles: ['user']
  }
}

export default fp(sessionAuthPlugin, {
  name: 'sessionAuth'
})
