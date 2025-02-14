import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { genKey } from '../utils'
import { Session } from '../types/won-flux-types'

const magicLinkAuth: FastifyPluginAsync = async (fastify, options) => {

  // Function to send a magic link to the user's email
  async function sendMagicLink(email: string, alias: string) {
    const token = genKey(18)
    let adjustedAlias = alias
    if (!alias || alias === '') {
      // TODO: use random display name generator - make it fun!!
      adjustedAlias = 'Gentle User'
    }
    const MINUTES_TIL_EXPIRES = 15

    const linkCreated = await fastify.data.auth.createMagicLink(email, adjustedAlias, token, MINUTES_TIL_EXPIRES)

    if (!linkCreated) {
      return false
    }

    // Compose email with magic link, and send using Resend
    const magicLink = `${fastify.config.API_BASE_URL}/login/magiclink/verify?token=${token}`
    const from = 'World of Nuclear <magiclink@support.worldofnuclear.com>'
    const subject = "Your Magic Link for Verification"
    const body = `
    <p><strong>Zanzibar's World of Nuclear Energy - Magic Link</strong></p>
    <p>Click the following link to verify your email and sign in to your account: ${magicLink}</p>
    <p>This link will expire in ${MINUTES_TIL_EXPIRES} minutes. You can always request a new one.</p>
    <p>If you did not request this, please accept our apologies and ignore this email.</p>
    <p>Regards,</p>
    <p>Zanzibar, Nuclear Hero</p>
    `

    await fastify.sendEmail(from, email, subject, body)
  }

  fastify.decorate('sendMagicLink', sendMagicLink)

  fastify.post('/login/magiclink', async (req, res) => {
    const { email, alias, token } = req.body as { email: string, alias: string, token: string }

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

    const success = await sendMagicLink(email, alias)

    res.send({ message: `A magic link sent to ${email} as you requested. Please check your email.`, status: "success" })
  })

  // Endpoint to handle the magic link verification
  fastify.get('/login/magiclink/verify', async (req, res) => {
    const { token } = req.query as { token: string }

    const magicData = await verifyToken(token)
    if (!magicData) {
      res.redirect(`${fastify.config.APP_BASE_URL}/signin/trouble?source=magiclink`)
      return
    }

    // create session token, set cookie, redirect to login confirm page
    const user = await findOrCreateUser(magicData.email, magicData.alias || 'Gentle User')
    if (!user) {
      return res.code(500).send({ error: 'Unable to find or create user' })
    }
    const sessionInfo: Session = {
      userId: user.id,
      alias: user.alias,
      roles: ['member']
    }
    const sessionToken = fastify.generateSessionToken(sessionInfo)
    fastify.setSessionToken(res, sessionToken)
    res.redirect(`${fastify.config.APP_BASE_URL}/signin/confirm`)
  })

  // Function to verify the token
  async function verifyToken(token: string) {
    let tokenData
    try {
      tokenData = await fastify.data.auth.findMagicToken(token)
    } catch (err) {
      fastify.log.info('Magic link token not found: ' + token)
      return
    }

    fastify.log.info('Magic link record: ' + JSON.stringify(tokenData))

    // already used?
    if (tokenData.verified_at) {
      // TODO: give user feedback that token was already used
      fastify.log.info('Magic link already consumed' + JSON.stringify(tokenData))
      return
    }

    // expired?
    if (tokenData.expires_at < new Date()) {
      fastify.log.info('Magic link has expired' + JSON.stringify(tokenData))
      await fastify.data.auth.failMagicToken(token)
      // TODO: give user feedback that token expired
      return
    }

    // Mark the email as verified in the database
    return await fastify.data.auth.consumeMagicToken(token)
  }

  async function findOrCreateUser(email: string, alias: string) {
    let user = await fastify.data.users.findUserByEmail(email)
    if (!user) {
      user = await fastify.data.users.createUser(email, alias)
      if (!user) {
        fastify.log.info(`User found or created: ${email} ${alias}`)
      }
    }
    return user
  }

  fastify.log.info('registered magic link auth plugin')
}

export default fp(magicLinkAuth, { name: 'magicLinkAuth', dependencies: ['db', 'resend', 'sessionAuth', 'turnstile', 'sensible'] })
