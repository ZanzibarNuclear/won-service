import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { genKey } from '../utils'

const magicLinkAuth: FastifyPluginAsync = async (fastify, options) => {

  // Function to send a magic link to the user's email
  async function sendMagicLink(email: string) {
    const token = genKey(18)
    const expiresAt = new Date(Date.now() + 3600000)

    // Save the token and expiration to the database
    await fastify.db.insertInto('magic_auth').values({
      email,
      token,
      expires_at: expiresAt
    }).execute()

    // Compose email with magic link, and send using Resend
    const magicLink = `${fastify.config.API_BASE_URL}/login/magiclink/verify?token=${token}`
    const from = 'World of Nuclear <magiclink@support.worldofnuclear.com>'
    const subject = "Your Magic Link for Verification"
    const body = `
    <p><strong>Zanzibar's World of Nuclear Energy - Magic Link</strong></p>
    <p>Click the following link to verify your email and sign in to your account: ${magicLink}</p>
    <p>This link will expire in 1 hour. You can always request a new one.</p>
    <p>If you did not request this, please accept our apologies and ignore this email.</p>
    <p>Regards,</p>
    <p>Zanzibar, Nuclear Hero</p>
    `

    /* 
    maybe add this later, once the positive case is working

    <p>P.S. If you never want to be contacted by Zanzibar's World of Nuclear Energy, 
    <a href="${fastify.config.API_BASE_URL}/login/magiclink/decline?token=${token}">click here</a>, and we will add you to our do-not-contact list.</p>
    */

    await fastify.sendEmail(from, email, subject, body)
  }

  fastify.decorate('sendMagicLink', sendMagicLink)

  // Endpoint to handle the magic link verification
  fastify.get('/login/magiclink/verify', async (req, res) => {
    const { token } = req.query as { token: string }

    const magicData = await verifyToken(token)
    if (!magicData) {
      res.send("Invalid or expired token.")
      return
    }

    // create session token, set cookie, redirect to login confirm page
    const user = await findOrCreateUser(magicData.email)
    const sessionToken = fastify.generateSessionToken({ userId: user.id, alias: user.alias, roles: ['member'] })
    fastify.setSessionToken(res, sessionToken)

    res.redirect('/signin/confirm')
  })

  // Function to verify the token
  async function verifyToken(token: string) {
    const tokenData = await fastify.db.selectFrom('magic_auth').where('token', '=', token).executeTakeFirst()

    if (!tokenData) {
      return
    }

    if (tokenData.expires_at < new Date()) {
      await fastify.db.updateTable('magic_auth').set({ failed_validation_at: new Date() }).where('token', '=', token).execute()
      return
    }

    // Mark the email as verified in the database
    const magicData = await fastify.db.updateTable('magic_auth').set({ verified_at: new Date() }).where('token', '=', token).executeTakeFirst()
    return magicData
  }

  async function findOrCreateUser(email: string) {
    let user = await fastify.db.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst()
    if (!user) {
      user = await fastify.db.insertInto('users').values({ email }).returningAll().executeTakeFirst()
    }
    return user
  }

  fastify.log.info('registered magic link auth plugin')
}

export default fp(magicLinkAuth, { name: 'magicLinkAuth', dependencies: ['db', 'resend', 'sessionAuth'] })
