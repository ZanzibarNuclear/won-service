import { FastifyPluginAsync } from 'fastify'
import oauthPlugin from '@fastify/oauth2'

const X_CONFIGURATION = {
  authorizationHost: 'https://x.com',
  authorizationPath: 'i/oauth2/authorize',
  tokenHost: 'https://x.com',
  tokenPath: '/2/oauth2/token',
  revokePath: '/2/oauth2/revoke'
}
const apiUrlBase = process.env.API_URL_BASE

const oauth2Plugin: FastifyPluginAsync = async (fastify, options) => {

  fastify.register(async (instance, opts, done) => {
    fastify.register(oauthPlugin, {
      name: 'githubOAuth2',
      scope: [],
      credentials: {
        client: {
          id: process.env.GITHUB_CLIENT_ID as string,
          secret: process.env.GITHUB_CLIENT_SECRET as string
        },
        auth: oauthPlugin.GITHUB_CONFIGURATION
      },
      startRedirectPath: '/login/github',
      callbackUri: `${apiUrlBase}/login/github/callback`
    })

    fastify.register(oauthPlugin, {
      name: 'googleOAuth2',
      scope: ['profile'],
      credentials: {
        client: {
          id: process.env.GOOGLE_CLIENT_ID as string,
          secret: process.env.GOOGLE_CLIENT_SECRET as string
        },
        auth: oauthPlugin.GOOGLE_CONFIGURATION
      },
      startRedirectPath: '/login/google',
      callbackUri: `${apiUrlBase}/login/google/callback`
    })

    fastify.register(oauthPlugin, {
      name: 'xOAuth2',
      credentials: {
        client: {
          id: process.env.X_CLIENT_ID as string,
          secret: process.env.X_CLIENT_SECRET as string
        },
        auth: X_CONFIGURATION
      },
      // register a fastify url to start the redirect flow to the service provider's OAuth2 login
      startRedirectPath: '/login/x',
      // service provider redirects here after user login
      callbackUri: `${apiUrlBase}/login/x/callback`
      // You can also define callbackUri as a function that takes a FastifyRequest and returns a string
      // callbackUri: req => `${req.protocol}://${req.hostname}/login/facebook/callback`,
    })

    done()
  }, { dependencies: ['cookie', 'dotenv', 'cors'] })
}

export default oauth2Plugin