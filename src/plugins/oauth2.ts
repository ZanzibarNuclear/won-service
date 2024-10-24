import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fastifyOAuth2, { FastifyOAuth2Options, OAuth2Namespace } from '@fastify/oauth2'
import { db } from '../db/Database'
import { createSessionToken } from '../utils/auth'

interface SupportedProviders {
  githubOAuth2: OAuth2Namespace
  googleOAuth2: OAuth2Namespace
}

type Envs = {
  APP_URL_BASE: string
}

const X_CONFIGURATION = {
  authorizeHost: 'https://x.com',
  authorizePath: 'i/oauth2/authorize',
  tokenHost: 'https://x.com',
  tokenPath: '/2/oauth2/token',
  revokePath: '/2/oauth2/revoke'
}

type User = { id: string; email: string; alias: string }

const oauth2Plugin: FastifyPluginAsync = async (fastify, options) => {
  // GitHub OAuth2
  await fastify.register(fastifyOAuth2, {
    name: 'githubOAuth2',
    scope: ['user:email'],
    credentials: {
      client: {
        id: process.env.GITHUB_CLIENT_ID,
        secret: process.env.GITHUB_CLIENT_SECRET
      },
      auth: fastifyOAuth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/login/github',
    callbackUri: `${process.env.API_URL_BASE}/login/github/callback`
  } as FastifyOAuth2Options)

  // Google OAuth2
  await fastify.register(fastifyOAuth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET
      },
      auth: fastifyOAuth2.GOOGLE_CONFIGURATION
    },
    startRedirectPath: '/login/google',
    callbackUri: `${process.env.API_URL_BASE}/login/google/callback`
  } as FastifyOAuth2Options)

  // Register X OAuth2
  await fastify.register(fastifyOAuth2, {
    name: 'xOAuth2',
    scope: ['tweet.read', 'users.read'], // Adjust scopes as needed
    credentials: {
      client: {
        id: process.env.X_CLIENT_ID,
        secret: process.env.X_CLIENT_SECRET
      },
      auth: X_CONFIGURATION
    },
    startRedirectPath: '/login/x',
    callbackUri: `${process.env.API_URL_BASE}/login/x/callback`
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
    const sessionToken = createSessionToken(user)

    fastify.log.info(`environment: ${JSON.stringify(process.env)}`)

    // For now, we'll just return the user info and token
    // fastify.log.info(`from config: ${JSON.stringify(fastify.config.APP_URL_BASE)}`)
    const toUrl = process.env.APP_URL_BASE
    fastify.log.info(`redirecting to ${toUrl}`)
    reply.redirect(`${toUrl}/signin/confirm?token=${sessionToken}`)
  }

  // Register callback routes for each provider
  fastify.get('/login/github/callback', async (request, reply) => {
    return handleOAuthCallback(request, reply, 'github')
  })

  fastify.get('/login/google/callback', async (request, reply) => {
    return handleOAuthCallback(request, reply, 'google')
  })
}

export default oauth2Plugin
