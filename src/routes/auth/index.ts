import { FastifyPluginAsync } from 'fastify'
import axios from 'axios'
import { db } from '../../db/Database'
import { createSessionToken } from '../../utils/auth'
async function fetchGoogleUserInfo(accessToken: string) {
  const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return response.data
}

const googleCallbackRoute: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/login/google/callback', async function (request, reply) {
    const { token } = await this.oauth2Google.getAccessTokenFromAuthorizationCodeFlow(request)

    // Fetch user info from Google
    const userInfo = await fetchGoogleUserInfo(token.access_token)

    // Check if user exists in your database
    let user = await db.selectFrom('users').where('email', '=', userInfo.email).executeTakeFirst()

    if (!user) {
      // Create new user if doesn't exist
      user = await db.insertInto('users').values({
        email: userInfo.email,
        name: userInfo.name,
        // other fields as needed
      }).returning('id').executeTakeFirst()
    }

    // Store or update OAuth tokens
    await db.insertInto('oauth_tokens').values({
      user_id: user.id,
      provider: 'google',
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: new Date(Date.now() + token.expires_in * 1000)
    }).onConflict(['user_id', 'provider']).merge().execute()

    // Create session or JWT for the user
    const sessionToken = createSessionToken(user)

    // Redirect to frontend with token
    reply.redirect(`http://your-frontend-url/auth-callback?token=${sessionToken}`)
  })
}

export default googleCallbackRoute
