import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import { db } from '../db/Database'
import type { Session } from '../types/won-flux-types'

interface SessionAuthPluginOptions {
  sessionSecret: string
}

const sessionAuthPlugin: FastifyPluginAsync<SessionAuthPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('session', null)

  let sessionCookieName = 'session_token'
  if (fastify.config.NODE_ENV !== 'production') {
    sessionCookieName += `_${fastify.config.NODE_ENV}`
  }

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = request.cookies[sessionCookieName]
    if (!sessionToken) {
      fastify.log.info(`no session token found`)
      return
    } else {
      fastify.log.info(`found session token: ${sessionToken}`)
    }
    try {
      if (!fastify.config.JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is not set')
      }
      const session = await verifySessionToken(sessionToken, fastify.config.JWT_SECRET_KEY)
      request.session = session
    } catch (error) {
      fastify.log.info('Removing session cookie due to verification failure:', { cause: error })
      fastify.removeSessionToken(reply)
    }
  })

  fastify.decorate('generateSessionToken', (sessionData: Session) => {
    return jwt.sign(sessionData, fastify.config.JWT_SECRET_KEY, { expiresIn: '7d' })
  })

  fastify.decorate('setSessionToken', (reply: FastifyReply, token: string) => {
    reply.setCookie(sessionCookieName, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      domain: fastify.config.COOKIE_DOMAIN || 'localhost'
    })
  })

  fastify.decorate('removeSessionToken', (reply: FastifyReply) => {
    reply.clearCookie(sessionCookieName, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      domain: fastify.config.COOKIE_DOMAIN || 'localhost'
    })
  })

  fastify.log.info('registered sessionAuth plugin')
}

async function verifySessionToken(token: string, secret: string): Promise<Session> {
  if (!token) {
    throw new Error('No session token provided')
  }
  if (!secret) {
    throw new Error('No JWT secret provided')
  }
  let decoded
  try {
    decoded = jwt.verify(token, secret)
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Session token has expired')
    } else {
      throw new Error('Failed to verify session token')
    }
  }
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
