import { FastifyPluginAsync } from 'fastify'
import axios from 'axios'

const memStore = new Map()

async function saveAccessToken(token: any) {
  memStore.set(token.refresh_token, token)
}

async function retrieveAccessToken(token: any) {
  // remove Bearer if needed
  if (token.startsWith('Bearer ')) {
    token = token.substring(6)
  }
  // any database or in-memory operation here
  // we use in-memory variable here
  if (memStore.has(token)) {
    memStore.get(token)
  }
  throw new Error('invalid refresh token')
}

// TODO: store token and refresh token in database; upsert social profile record on login
// TODO: implement revoke to be called on logout

const githubCallbackRoute: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/callback', async function (request, reply) {
    const token = await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

    console.log(token.access_token)

    // you should store the `token` for further usage
    await saveAccessToken(token)

    reply.send({ access_token: token.access_token })
  })

  fastify.get('/refreshAccessToken', async function (request, reply) {
    // we assume the token is passed by authorization header
    const refreshToken = await retrieveAccessToken(request.headers.authorization)
    const newToken = await this.githubOAuth2.getAccessTokenFromRefreshToken(refreshToken, {})

    // we save the token again
    await saveAccessToken(newToken)

    reply.send({ access_token: newToken.access_token })
  })

  // Check access token: https://docs.github.com/en/rest/apps/oauth-applications#check-a-token
  fastify.get('/verifyAccessToken', async function (request, reply) {
    const { accessToken } = request.query as { accessToken: string }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    try {
      const response = await axios({
        url: `https://api.github.com/applications/${clientId}/token`,
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        },
        data: { access_token: accessToken }
      });

      reply.send(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        reply.send(error.response?.data || error.message);
      } else {
        reply.send('An unexpected error occurred');
      }
    }
  })
}

export default githubCallbackRoute
