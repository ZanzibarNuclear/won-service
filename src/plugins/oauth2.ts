import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fastifyOAuth2, { FastifyOAuth2Options, OAuth2Namespace } from '@fastify/oauth2'
import { db } from '../db/Database'
import { createSessionToken } from '../utils/auth'

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

    const userInfo = await getUserInfo(provider, token.access_token)
    fastify.log.info(`user info from ${provider}: ${JSON.stringify(userInfo)}`)

    const { id: socialId, email: socialEmail, name: socialName } = userInfo

    // 1. Check if the user exists in your database

    let user = await db.selectFrom('users').where('email', '=', userInfo.email).executeTakeFirst() as User | undefined

    // 2. Create a new user if they don't exist
    if (!user) {
      user = await db.insertInto('users').values({
        email: socialEmail,
        alias: socialName,
        last_sign_in_at: new Date()
      }).returning(['id', 'email', 'alias']).executeTakeFirst() as User | undefined
    }
    if (!user) {
      throw new Error('Problem creating user record')
    }

    // 3. Store or update the OAuth tokens
    const authTokens = await db.insertInto('oauth_tokens').values({
      user_id: user.id,
      provider: provider,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: new Date(Date.now() + token.expires_in * 1000)
    }).executeTakeFirst()
    if (!authTokens) {
      throw new Error('Problem creating OAuth tokens record')
    }

    const socialIdentity = await db.insertInto('identities').values({
      user_id: user.id,
      provider_id: socialId,
      provider: provider,
      identity_data: userInfo,
      email: socialEmail,
      last_sign_in_at: new Date()
    }).executeTakeFirst()
    if (!socialIdentity) {
      throw new Error('Problem creating social identity record')
    }

    // 3.5 Get refresh token from identity provider

    // 4. Create a session or JWT for the user
    const sessionToken = createSessionToken(user)

    // For now, we'll just return the user info and token
    reply.redirect(`${process.env.APP_BASE_URL}/signin/confirm?token=${sessionToken}`)
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
