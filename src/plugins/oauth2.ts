import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fastifyOAuth2, { FastifyOAuth2Options, OAuth2Namespace } from '@fastify/oauth2'
import jwt from 'jsonwebtoken'
import { db } from '../db/Database'

import type { Session } from '../types/session'

interface SupportedProviders {
  githubOAuth2: OAuth2Namespace
  googleOAuth2: OAuth2Namespace
}

const X_CONFIGURATION = {
  authorizeHost: 'https://x.com',
  authorizePath: 'i/oauth2/authorize',
  tokenHost: 'https://x.com',
  tokenPath: '/2/oauth2/token',
  revokePath: '/2/oauth2/revoke'
}

const oauth2Plugin: FastifyPluginAsync = async (fastify, options) => {
  // GitHub OAuth2
  await fastify.register(fastifyOAuth2, {
    name: 'githubOAuth2',
    scope: ['user:email'],
    credentials: {
      client: {
        id: fastify.config.GITHUB_CLIENT_ID,
        secret: fastify.config.GITHUB_CLIENT_SECRET
      },
      auth: fastifyOAuth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/login/github',
    callbackUri: `${fastify.config.API_BASE_URL}/login/github/callback`
  } as FastifyOAuth2Options)

  // Google OAuth2
  await fastify.register(fastifyOAuth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: fastify.config.GOOGLE_CLIENT_ID,
        secret: fastify.config.GOOGLE_CLIENT_SECRET
      },
      auth: fastifyOAuth2.GOOGLE_CONFIGURATION
    },
    startRedirectPath: '/login/google',
    callbackUri: `${fastify.config.API_BASE_URL}/login/google/callback`
  } as FastifyOAuth2Options)

  // Register X OAuth2
  await fastify.register(fastifyOAuth2, {
    name: 'xOAuth2',
    scope: ['tweet.read', 'users.read'], // Adjust scopes as needed
    credentials: {
      client: {
        id: fastify.config.X_CLIENT_ID,
        secret: fastify.config.X_CLIENT_SECRET
      },
      auth: X_CONFIGURATION
    },
    startRedirectPath: '/login/x',
    callbackUri: `${fastify.config.API_BASE_URL}/login/x/callback`
  } as FastifyOAuth2Options)

  // Helper function to get user info based on provider
  const getUserInfo = async (provider: 'github' | 'google' | 'x', accessToken: string) => {
    let userInfo
    switch (provider) {
      case 'github':
        userInfo = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json())
        break
      case 'google':
        userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json())
        break
      case 'x':
        userInfo = await fetch('https://api.x.com/2/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json())
        break
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
    return userInfo
  }

  // Generic callback handler
  const handleOAuthCallback = async (request: FastifyRequest, reply: FastifyReply, provider: 'github' | 'google') => {

    // if (request.session) {
    //   fastify.log.info('Session is active. No need to sign in.')
    //   reply.redirect(`${fastify.config.APP_BASE_URL}/join?step=2`)
    //   return
    // }

    const oauth2 = fastify[`${provider}OAuth2` as keyof SupportedProviders]
    const { token } = await oauth2.getAccessTokenFromAuthorizationCodeFlow(request)

    // 1. Get user info from provider
    const userInfo = await getUserInfo(provider, token.access_token)
    fastify.log.info(`user info from ${provider}: ${JSON.stringify(userInfo)}`)

    const { id: socialId, email: socialEmail, name: socialName } = userInfo

    // 2. Check if the user exists in your database
    let user = await db.selectFrom('users').selectAll().where('email', '=', socialEmail).executeTakeFirst()
    if (user) {
      fastify.log.info(`user: ${JSON.stringify(user)}`)
    }

    if (user === null || user === undefined || Object.keys(user).length === 0) {
      fastify.log.info('Creating record for new user')
      user = await db.insertInto('users').values({
        email: socialEmail,
        alias: socialName,
        last_sign_in_at: new Date()
      }).returningAll().executeTakeFirst()
    }
    if (!user) {
      throw new Error('Problem finding orcreating user record')
    }

    // 3. Create a social identity record including user info and auth tokens from identity provider
    let socialIdentity = await db.selectFrom('identities').selectAll().where('user_id', '=', user.id).where('provider', '=', provider).executeTakeFirst()
    if (socialIdentity) {
      fastify.log.info(`social identity: ${JSON.stringify(socialIdentity)}`)
    }

    if (!socialIdentity) {
      socialIdentity = await db.insertInto('identities').values({
        user_id: user.id,
        provider_id: socialId,
        provider: provider,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        identity_data: userInfo,
        last_sign_in_at: new Date()
      }).returningAll().executeTakeFirst()
    }
    if (!socialIdentity) {
      throw new Error('Problem creating social identity record')
    }

    // 4. Create a session token
    const sessionInfo: Session = {
      userId: user.id,
      alias: user.alias,
      roles: ['member']
    }
    const secretKey: string = fastify.config.JWT_SECRET_KEY || ''
    fastify.log.info(`found secretKey: ${secretKey}`)
    const sessionToken = jwt.sign(sessionInfo, secretKey, { expiresIn: '1d' })
    reply.setCookie('session_token', sessionToken, {
      httpOnly: true,
      secure: true
    })
    fastify.log.info(`set cookie session_token: ${sessionToken}`)

    const toUrl = `${fastify.config.APP_BASE_URL}/signin/confirm?token=${sessionToken}`
    fastify.log.info(`redirecting to ${toUrl}`)
    reply.redirect(toUrl)
    fastify.log.info(`reply has cookies?: ${JSON.stringify(reply.getHeaders())}`)
  }

  // Register callback routes for each provider
  fastify.get('/login/github/callback', async (request, reply) => {
    return handleOAuthCallback(request, reply, 'github')
  })

  fastify.get('/login/google/callback', async (request, reply) => {
    return handleOAuthCallback(request, reply, 'google')
  })

  fastify.log.info(`registered oauth2 plugin`)
}

export default fp(oauth2Plugin, { name: 'oauth2', dependencies: ['sensible', 'sessionAuth', 'cookie'] })
