import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import { db } from '../db/Database'
import type { Session } from '../types/session'

interface SessionAuthPluginOptions {
  sessionSecret: string
}

const sessionCookieName = 'session_token'

const sessionAuthPlugin: FastifyPluginAsync<SessionAuthPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('session', null)

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = request.cookies[sessionCookieName]
    if (!sessionToken) {
      fastify.log.info(`no session token found`)
      return
    } else {
      // TODO: remove once things are working
      fastify.log.info(`found session token: ${sessionToken}`)
    }
    try {
      const session = await verifySessionToken(sessionToken, fastify.config.JWT_SECRET_KEY)
      fastify.log.info(`stashing verified session on request: ${JSON.stringify(session)}`)
      request.session = session
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Session token has expired; please implement refresh logic', { cause: error })
      } else {
        if (!fastify.config.JWT_SECRET_KEY) {
          fastify.log.error('Cannot verify session tokens. JWT_SECRET_KEY is not set.')
        }
        throw new Error('Failed to verify session token', { cause: error })
      }
    }
  })

  fastify.decorate('generateSessionToken', (sessionData: Session) => {
    return jwt.sign(sessionData, fastify.config.JWT_SECRET_KEY, { expiresIn: '7d' })
  })

  fastify.decorate('setSessionToken', (reply: FastifyReply, token: string) => {
    reply.setCookie(sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week, adjust as needed
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
