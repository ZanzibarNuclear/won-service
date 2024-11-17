import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { genKey } from '../utils'
import { Session } from '../types/won-flux-types'

const magicLinkAuth: FastifyPluginAsync = async (fastify, options) => {

  // Function to send a magic link to the user's email
  async function sendMagicLink(email: string, alias: string) {
    const token = genKey(18)
    const expiresAt = new Date(Date.now() + 3600000)

    let adjustedAlias = alias
    if (!alias || alias === '') {
      adjustedAlias = 'Gentle Reader'  // TODO: use random display name generator
    }

    // Save the token and expiration to the database
    await fastify.db.insertInto('magic_auth').values({
      email,
      alias: adjustedAlias,
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

  fastify.post('/login/magiclink', async (req, res) => {
    const { email, alias, token } = req.body as { email: string, alias: string, token: string }
    fastify.log.info(`sendMagicLink: email=${email} alias=${alias} turnstileToken=${token} ip=${req.ip}`)

    // validate turnstile token
    const turnstileResponse = await fastify.validateTurnstile(token, req.ip)
    if (!turnstileResponse.success) {
      res.status(400).send("Failed non-bot verification.")
      return
    }

    // validate email
    if (!email || !email.includes('@')) {
      res.status(400).send("Invalid email address.")
      return
    }

    await sendMagicLink(email, alias)
    res.send({ message: `A magic link sent to ${email} as you requested. Please check your email.`, status: "success" })
  })

  // Endpoint to handle the magic link verification
  fastify.get('/login/magiclink/verify', async (req, res) => {
    const { token } = req.query as { token: string }

    const magicData = await verifyToken(token)
    if (!magicData) {
      res.redirect(`${fastify.config.APP_BASE_URL}/signin/trouble?source=magiclink`)
      return
    } else {
      fastify.log.info(`Magic link verified for ${magicData.email} ${magicData.alias}`)
    }

    // create session token, set cookie, redirect to login confirm page
    const user = await findOrCreateUser(magicData.email, magicData.alias)
    const sessionInfo: Session = {
      userId: user.id,
      alias: user.alias,
      roles: ['member']
    }
    const sessionToken = fastify.generateSessionToken(sessionInfo)
    fastify.setSessionToken(res, sessionToken)
    res.redirect(`${fastify.config.APP_BASE_URL}/signin/confirm`)

    fastify.log.info(`response has cookies?: ${JSON.stringify(res.getHeaders())}`)
  })

  // Function to verify the token
  async function verifyToken(token: string) {
    const tokenData = await fastify.db
      .selectFrom('magic_auth')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirst()
    fastify.log.info(`Token data: ${JSON.stringify(tokenData)}`)

    // exists?
    if (!tokenData) {
      return
    }

    // already used?
    if (tokenData.verified_at) {
      return
    }

    // expired?
    if (tokenData.expires_at < new Date()) {
      await fastify.db.updateTable('magic_auth').set({ failed_validation_at: new Date() }).where('token', '=', token).execute()
      return
    }

    // Mark the email as verified in the database
    const magicData = await fastify.db.updateTable('magic_auth').set({ verified_at: new Date() }).where('token', '=', token).returningAll().executeTakeFirst()
    return magicData
  }

  async function findOrCreateUser(email: string, alias: string) {
    let user = await fastify.db.selectFrom('users')
      .selectAll()
      .where((eb: any) => eb.fn('lower', ['email']), '=', email.toLowerCase())
      .executeTakeFirst()
    if (!user) {
      user = await fastify.db.insertInto('users').values({ email, alias, last_sign_in_at: new Date() }).returningAll().executeTakeFirst()
    }
    fastify.log.info(`User found or created: ${user.email} ${user.alias}`)
    return user
  }

  fastify.log.info('registered magic link auth plugin')
}

export default fp(magicLinkAuth, { name: 'magicLinkAuth', dependencies: ['db', 'resend', 'sessionAuth', 'turnstile', 'sensible'] })
