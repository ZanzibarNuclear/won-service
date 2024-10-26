import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import jwt from 'jsonwebtoken'
import { db } from '../db/Database'
import type { Session } from '../types/session'
import fp from 'fastify-plugin'

interface SessionAuthPluginOptions {
  sessionSecret: string
}

const sessionAuthPlugin: FastifyPluginAsync<SessionAuthPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('session', null)

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info(`looking for session token`)
    const sessionToken = request.cookies['session_token']
    if (!sessionToken) {
      fastify.log.info(`no session token found among cookies: ${JSON.stringify(request.cookies)}`)
      return
    }
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
  fastify.log.info('registered sessionAuth plugin')
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

export default fp(sessionAuthPlugin, { name: 'sessionAuth', dependencies: ['env', 'cookie'] })
