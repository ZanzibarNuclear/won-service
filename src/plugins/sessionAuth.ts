import fastify, { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
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
    const sessionToken = request.cookies['session_token']
    if (!sessionToken) {
      fastify.log.info(`no session token found`)
      return
    } else {
      fastify.log.info(`found session token: ${sessionToken}`)
    }
    try {
      let session
      try {
        session = await verifySessionToken(sessionToken, fastify.config.JWT_SECRET_KEY)
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new Error('Session token has expired; implement refresh logic', { cause: error })
        } else {
          throw new Error('Failed to verify session token', { cause: error })
        }
      }
      fastify.log.info(`session verified: ${JSON.stringify(session)}`)
      request.session = session
    } catch (error) {
      if (!fastify.config.JWT_SECRET_KEY) {
        fastify.log.error('Cannot verify session tokens. JWT_SECRET_KEY is not set.')
        reply.clearCookie('session_token')
      }
      fastify.log.error(`Failed to verify session token: ${error}`)
      reply.clearCookie('session_token')
    }
  })

  fastify.decorate('setSessionToken', (reply: FastifyReply, token: string) => {
    reply.setCookie('session_token', token, {
      httpOnly: true,
      secure: true, // Use true in production with HTTPS
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
