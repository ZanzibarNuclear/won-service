import { FastifyPluginAsync } from 'fastify'
import axios from 'axios'

const googleCallbackRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/callback', async function (request, reply) {
    this.xOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, async (err: any, result: any) => {
      if (err) {
        reply.send(err)
        return
      }
      try {
        const response = await axios.get('https://api.x.com/2/users/me', {
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
