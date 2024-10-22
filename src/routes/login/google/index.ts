import { FastifyPluginAsync } from 'fastify'
import axios from 'axios'

const googleCallbackRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/callback', async function (request, reply) {
    this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, async (err: any, result: any) => {
      if (err) {
        reply.send(err)
        return
      }
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${result.token.access_token}`
          }
        });
        reply.send(response.data);
      } catch (error) {
        reply.send(error);
      }
    })
  })
}

export default googleCallbackRoute
