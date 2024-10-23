import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fastifyOAuth2, { FastifyOAuth2Options, OAuth2Namespace } from '@fastify/oauth2'
import { db } from '../db/Database'
import { createSessionToken } from '../utils/auth'

interface SupportedProviders {
  githubOAuth2: OAuth2Namespace
  googleOAuth2: OAuth2Namespace
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
    callbackUri: 'http://localhost:3000/login/github/callback'
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
    callbackUri: 'http://localhost:3000/login/google/callback'
  } as FastifyOAuth2Options)

  // Helper function to get user info based on provider
  const getUserInfo = async (provider: 'github' | 'google', accessToken: string) => {
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

    // 1. Check if the user exists in your database

    let user = await db.selectFrom('users').where('email', '=', userInfo.email).executeTakeFirst() as User | undefined

    // 2. Create a new user if they don't exist
    if (!user) {
      user = await db.insertInto('users').values({
        email: userInfo.email,
        alias: userInfo.name,
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
    }).execute()
    if (!authTokens.length) {
      throw new Error('Problem creating OAuth tokens record')
    }

    // 4. Create a session or JWT for the user
    const sessionToken = createSessionToken(user)

    // For now, we'll just return the user info and token
    reply.redirect(`http://your-frontend-url/auth-callback?token=${sessionToken}`)
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
