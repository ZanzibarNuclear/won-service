import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fastifyOAuth2, { FastifyOAuth2Options, OAuth2Namespace } from '@fastify/oauth2'
import fp from 'fastify-plugin'
import type { UserCredentials } from '../types/won-flux-types'

type providerCodes = 'github' | 'google' | 'discord' | 'spotify'
interface ProviderParams {
  provider: providerCodes
}
interface SupportedProviders {
  githubOAuth2: OAuth2Namespace
  googleOAuth2: OAuth2Namespace
  discordOAuth2: OAuth2Namespace
  spotifyOAuth2: OAuth2Namespace
  // xOAuth2: OAuth2Namespace
  // metaOAuth2: OAuth2Namespace
}

// const X_CONFIGURATION = {
//   authorizeHost: 'https://api.x.com',
//   authorizePath: '2/oauth2/authorize',
//   tokenHost: 'https://api.x.com',
//   tokenPath: '2/oauth2/token',
//   revokePath: '2/oauth2/revoke'
// }

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
  fastify.log.info(`oauth2: github`)

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
  fastify.log.info(`oauth2: google`)

  // Register Discord OAuth2
  await fastify.register(fastifyOAuth2, {
    name: 'discordOAuth2',
    scope: ['identify', 'email', 'openid'],
    credentials: {
      client: {
        id: fastify.config.DISCORD_CLIENT_ID,
        secret: fastify.config.DISCORD_CLIENT_SECRET
      },
      auth: fastifyOAuth2.DISCORD_CONFIGURATION
    },
    startRedirectPath: '/login/discord',
    callbackUri: `${fastify.config.API_BASE_URL}/login/discord/callback`
  } as FastifyOAuth2Options)
  fastify.log.info(`oauth2: discord`)

  // Register Spotify OAuth2
  // await fastify.register(fastifyOAuth2, {
  //   name: 'spotifyOAuth2',
  //   scope: ['user-read-email', 'user-read-private'],
  //   credentials: {
  //     client: {
  //       id: fastify.config.SPOTIFY_CLIENT_ID,
  //       secret: fastify.config.SPOTIFY_CLIENT_SECRET
  //     },
  //     auth: fastifyOAuth2.SPOTIFY_CONFIGURATION,
  //   },
  //   startRedirectPath: '/login/spotify',
  //   callbackUri: `${fastify.config.ALT_BASE_URL}/login/spotify/callback`
  // } as FastifyOAuth2Options)
  // fastify.log.info(`oauth2: discord`)

  // Register Apple OAuth2
  // await fastify.register(fastifyOAuth2, {
  //   name: 'appleOAuth2',
  //   credentials: {
  //     client: {
  //       id: fastify.config.APPLE_CLIENT_ID,
  //       secret: fastify.config.APPLE_CLIENT_SECRET
  //     },
  //     auth: fastifyOAuth2.APPLE_CONFIGURATION,
  //     options: {
  //       authorizationMethod: 'body'
  //     }
  //   },
  //   startRedirectPath: '/login/apple',
  //   callbackUri: `${fastify.config.ALT_BASE_URL}/login/apple/callback`
  // })

  // Register X OAuth2
  // await fastify.register(fastifyOAuth2, {
  //   name: 'xOAuth2',
  //   scope: ['users.read', 'offline.access'],
  //   credentials: {
  //     client: {
  //       id: fastify.config.X_CLIENT_ID,
  //       secret: fastify.config.X_CLIENT_SECRET
  //     },
  //     auth: X_CONFIGURATION
  //   },
  //   startRedirectPath: '/login/x',
  //   callbackUri: `${fastify.config.API_BASE_URL}/login/x/callback`
  // } as FastifyOAuth2Options)
  // fastify.log.info(`oauth2: x`)

  // Register Meta (Facebook, Instagram, etc.) OAuth2
  // await fastify.register(fastifyOAuth2, {
  //   name: 'metaOAuth2',
  //   scope: ['email', 'public_profile'],
  //   credentials: {
  //     client: {
  //       id: fastify.config.FACEBOOK_CLIENT_ID,
  //       secret: fastify.config.FACEBOOK_CLIENT_SECRET
  //     },
  //     auth: fastifyOAuth2.FACEBOOK_CONFIGURATION
  //   },
  //   startRedirectPath: '/login/meta',
  //   callbackUri: `${fastify.config.API_BASE_URL}/login/meta/callback`
  // } as FastifyOAuth2Options)
  // fastify.log.info(`oauth2: meta`)

  // Helper function to get user info based on provider
  const getUserInfo = async (provider: providerCodes, accessToken: string) => {
    let userInfo
    switch (provider) {
      case 'github':
        userInfo = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json());

        // Fetch emails separately
        const emails = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json());

        // Find the primary email
        const primaryEmail = emails.find((email: any) => email.primary && email.verified)
        userInfo.email = primaryEmail ? primaryEmail.email : null // Set email if found
        break
      case 'google':
        userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json())
        break
      case 'discord':
        userInfo = await fetch('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json())
        break
      // case 'spotify':
      //   userInfo = await fetch('', {
      //     headers: { Authorization: `Bearer ${accessToken}` }
      //   }).then(res => res.json())
      //   break
      // case 'meta':
      //   userInfo = await fetch('https://graph.facebook.com/v19.0/me', {
      //     headers: { Authorization: `Bearer ${accessToken}` },
      //   }).then(res => res.json())
      //   break
      // case 'x':
      //   const sourceUserInfo = await fetch('https://api.x.com/2/users/me?user.fields=id,username,email', {
      //     headers: { Authorization: `Bearer ${accessToken}` }
      //   }).then(res => res.json())
      //   // map fields to required
      //   userInfo = {
      //     id: sourceUserInfo.id,
      //     email: sourceUserInfo.email,
      //     name: sourceUserInfo.username
      //   }
      //   break
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
    return userInfo
  }

  // Generic callback handler
  const handleOAuthCallback = async (request: FastifyRequest, reply: FastifyReply, provider: providerCodes) => {

    let accessToken
    let refreshToken
    try {
      const oauth2 = fastify[`${provider}OAuth2` as keyof SupportedProviders]
      const { token } = await oauth2.getAccessTokenFromAuthorizationCodeFlow(request)
      if (token) {
        accessToken = token.access_token
        refreshToken = token.refresh_token
      }
    } catch (error) {
      fastify.log.error(`error getting access token from authorization code flow: ${error}`)
      reply.status(500).send({ error: 'Internal Server Error' })
      return
    }

    // 1. Get user info from provider
    const userInfo = await getUserInfo(provider, accessToken)
    fastify.log.info(`oauth2: userInfo: ${JSON.stringify(userInfo)}`)
    if (!userInfo.email) {
      reply.status(401).send({ error: 'User email not found. Cannot authenticate user.' })
    }

    const { id: socialId, email: socialEmail } = userInfo

    // 2. Check if the user exists in database
    let user = await fastify.data.users.signInUser(socialEmail || '')

    if (!user) {
      user = await fastify.data.users.createUser(socialEmail)
      if (user) {
        await fastify.data.users.grantRole(user.id, 'user')
        await fastify.data.users.grantRole(user.id, 'member')
      } else {
        throw new Error('Problem creating user record')
      }
    }

    // 3. Create a social identity record including user info and auth tokens from identity provider
    let socialIdentity = await fastify.data.auth.signInWithIdentity(user.id, provider)

    if (!socialIdentity) {
      socialIdentity = await fastify.data.auth.createIdentity(user.id, socialId, provider, accessToken, refreshToken, userInfo)
      if (!socialIdentity) {
        throw new Error('Problem creating social identity record')
      }
    }

    // 4. Create a session token
    const credentials: UserCredentials = await fastify.data.users.getCreds(user.id)
    const sessionToken = fastify.generateSessionToken(credentials)
    fastify.setSessionToken(reply, sessionToken)

    // 5. Redirect user to confirmation page
    const toUrl = `${fastify.config.APP_BASE_URL}/sign-in/confirm`
    reply.redirect(toUrl)
  }

  // Register callback route
  fastify.get<{ Params: ProviderParams }>('/login/:provider/callback', async (request, reply) => {
    const { provider } = request.params
    return handleOAuthCallback(request, reply, provider)
  })

  fastify.log.info(`registered oauth2 plugin`)
}

export default fp(oauth2Plugin, { name: 'oauth2', dependencies: ['sensible', 'sessionAuth', 'cookie', 'dataAccess'] })
