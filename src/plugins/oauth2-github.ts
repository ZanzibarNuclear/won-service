
import { FastifyPluginAsync } from 'fastify'
import fastifyOauth2, { FastifyOAuth2Options } from '@fastify/oauth2'

const oauth2GithubPlugin: FastifyPluginAsync = async (fastify, options) => {
  const apiUrlBase = process.env.API_URL_BASE
  fastify.log.info(`apiUrlBase: ${apiUrlBase}`)

  await fastify.register(fastifyOauth2, {
    name: 'oauth2Github',
    scope: [],
    credentials: {
      client: {
        id: process.env.GITHUB_CLIENT_ID,
        secret: process.env.GITHUB_CLIENT_SECRET
      },
      auth: fastifyOauth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/login/github',
    callbackUri: `${apiUrlBase}/login/github/callback`
  } as FastifyOAuth2Options)


  const memStore = new Map()

  async function saveAccessToken(token: any) {
    // TODO: use database instead of in-memory
    memStore.set(token.refresh_token, token)
  }

  async function retrieveAccessToken(token: any) {
    // remove Bearer if needed
    if (token.startsWith('Bearer ')) {
      token = token.substring(6)
    }
    // TODO: use database instead of in-memory
    // we use in-memory variable here
    if (memStore.has(token)) {
      memStore.get(token)
    }
    throw new Error('invalid refresh token')
  }

  fastify.get('/login/github/callback', async function (request, reply) {
    const token = await fastify.oauth2Github.getAccessTokenFromAuthorizationCodeFlow(request)

    console.log(token.access_token)

    // you should store the `token` for further usage
    await saveAccessToken(token)

    reply.send({ access_token: token.access_token })
  })

  fastify.get('/login/github/refreshAccessToken', async function (request, reply) {
    // we assume the token is passed by authorization header
    const refreshToken = await retrieveAccessToken(request.headers.authorization)
    const newToken = await fastify.oauth2Github.getAccessTokenFromRefreshToken(refreshToken, {})

    // we save the token again
    await saveAccessToken(newToken)

    reply.send({ access_token: newToken.access_token })
  })

  // Check access token: https://docs.github.com/en/rest/apps/oauth-applications#check-a-token
  fastify.get('/login/github/verifyAccessToken', function (request, reply) {
    const { accessToken } = request.query as { accessToken: string }

    fetch(`https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token`, {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(process.env.GITHUB_CLIENT_ID + ':' + process.env.GITHUB_CLIENT_SECRET).toString(
            'base64'
          ),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ access_token: accessToken })
    })
      .then(response => response.json())
      .then(data => {
        reply.send(data)
      })
      .catch(err => {
        reply.send(err)
      })
  })

}

export default oauth2GithubPlugin
