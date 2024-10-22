import { FastifyPluginAsync } from 'fastify'

const oauth2GithubRoutes: FastifyPluginAsync = async (fastify, options) => {
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

  fastify.get('/callback', async function (request, reply) {
    const token = await fastify.oauth2Github.getAccessTokenFromAuthorizationCodeFlow(request)

    console.log(token.access_token)

    // you should store the `token` for further usage
    await saveAccessToken(token)

    reply.send({ access_token: token.access_token })
  })

  fastify.get('/refreshAccessToken', async function (request, reply) {
    // we assume the token is passed by authorization header
    const refreshToken = await retrieveAccessToken(request.headers.authorization)
    const newToken = await fastify.oauth2Github.getAccessTokenFromRefreshToken(refreshToken, {})

    // we save the token again
    await saveAccessToken(newToken)

    reply.send({ access_token: newToken.access_token })
  })

  // Check access token: https://docs.github.com/en/rest/apps/oauth-applications#check-a-token
  fastify.get('/verifyAccessToken', function (request, reply) {
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

export default oauth2GithubRoutes
