import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import type { UserCredentials } from '../types/won-flux-types'

interface SessionAuthPluginOptions {
  sessionSecret: string
}

const sessionAuthPlugin: FastifyPluginAsync<SessionAuthPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('session', null)
  fastify.decorateRequest('userId', null)

  let sessionCookieName = 'session_token'
  if (fastify.config.NODE_ENV !== 'production') {
    sessionCookieName += `_${fastify.config.NODE_ENV}`
  }

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip if session is already set by the session plugin
    if (request.session) {
      fastify.log.info('session plug-in: Creds already established')
      return
    }

    const sessionToken = request.cookies[sessionCookieName]
    if (!sessionToken) {
      fastify.log.info('no session token')
      return
    }
    fastify.log.info('session token found')
    try {
      const creds = await verifySessionToken(sessionToken, fastify.config.JWT_SECRET_KEY)
      const sessionData = {
        userId: creds.sub,
        alias: creds.name,
        roles: creds.role
      }
      request.session = sessionData
      request.userId = creds.sub
    } catch (error) {
      fastify.log.info('Removing session cookie due to verification failure:', { cause: error })
      fastify.removeSessionToken(reply)
    }
  })

  fastify.decorate('generateSessionToken', (credentials: UserCredentials) => {
    return jwt.sign(credentials, fastify.config.JWT_SECRET_KEY, { expiresIn: '7d' })
  })

  fastify.decorate('setSessionToken', (reply: FastifyReply, token: string) => {
    reply.setCookie(sessionCookieName, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: fastify.config.COOKIE_DOMAIN || 'localhost'
    })
  })

  fastify.decorate('removeSessionToken', (reply: FastifyReply) => {
    reply.clearCookie(sessionCookieName, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: fastify.config.COOKIE_DOMAIN || 'localhost'
    })
  })

  async function verifySessionToken(token: string, secret: string): Promise<UserCredentials> {
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
    const creds = decoded as UserCredentials
    const user = await fastify.data.users.getUser(creds.sub)
    if (!user) {
      throw new Error('User not found')
    }

    return creds
  }

  if (!fastify.config.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not set')
  }

  fastify.log.info('registered session plugin')
}

export default fp(sessionAuthPlugin, { name: 'sessionAuth', dependencies: ['env', 'cookie', 'dataAccess'] })
