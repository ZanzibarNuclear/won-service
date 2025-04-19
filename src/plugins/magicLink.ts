import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { genKey } from '../utils'
import { UserCredentials } from '../types/won-flux-types'

const magicLinkAuth: FastifyPluginAsync = async (fastify, options) => {

  // Function to send a magic link to the user's email
  async function sendMagicLink(email: string) {
    const token = genKey(18)
    const MINUTES_TIL_EXPIRES = 15

    const linkCreated = await fastify.data.auth.createMagicLink(email, token, MINUTES_TIL_EXPIRES)

    if (!linkCreated) {
      return false
    }

    // Compose email with magic link, and send using Resend
    const magicLink = `${fastify.config.API_BASE_URL}/login/magiclink/verify?token=${token}`
    const signInPage = `${fastify.config.APP_BASE_URL}/sign-in`
    const from = 'World of Nuclear <magiclink@support.worldofnuclear.com>'
    const subject = "Your Magic Link for Verification"
    const body = `
    <p><strong>Zanzibar's World of Nuclear Energy - Magic Link</strong></p>
    <p>Hello. Here is your magic link to the World of Nuclear website. To sign in to your account, click this link: ${magicLink}</p>
    <p>The link will expire in ${MINUTES_TIL_EXPIRES} minutes. You can always request a new one here: ${signInPage}</p>
    <p>If you did not request a magic link, please ignore this email, and enjoy the rest of your day.</p>
    <p>Regards,</p>
    <p>Zanzibar, Nuclear Hero</p>
    `

    await fastify.sendAuthEmail(from, email, subject, body)
  }

  fastify.decorate('sendMagicLink', sendMagicLink)

  fastify.post('/login/magiclink', async (req, res) => {
    const { email, token } = req.body as { email: string, token: string }

    // validate turnstile token
    const turnstileResponse = await fastify.validateTurnstile(token, req.ip)
    if (!turnstileResponse.success) {
      fastify.log.warn('Seems like we need to block a bot.')
      return res.status(200).send({
        status: 'failed',
        message: 'Failed non-bot verification.'
      })
    }

    // validate email
    if (!email || !email.includes('@')) {
      return res.status(400).send("Invalid email address.")
    }

    const success = fastify.sendMagicLink(email)

    res.send({ message: `A magic link sent to ${email} as you requested. Please check your email.`, status: "success" })
  })

  // Endpoint to handle the magic link verification
  fastify.get('/login/magiclink/verify', async (req, res) => {
    const { token } = req.query as { token: string }

    const magicData = await verifyToken(token)
    if (!magicData) {
      res.redirect(`${fastify.config.APP_BASE_URL}/sign-in/trouble?source=magiclink`)
      return
    }

    // create session token, set cookie, redirect to login confirm page
    const user = await findOrCreateUser(magicData.email)
    if (!user) {
      return res.code(500).send({ error: 'Unable to find or create user' })
    }
    const credentials: UserCredentials = await fastify.data.users.getCreds(user.id)
    const sessionToken = fastify.generateSessionToken(credentials)
    fastify.setSessionToken(res, sessionToken)
    res.redirect(`${fastify.config.APP_BASE_URL}/sign-in/confirm`)
  })

  // Function to verify the token
  async function verifyToken(token: string) {
    let tokenData: any
    try {
      tokenData = await fastify.data.auth.findMagicToken(token)
    } catch (err) {
      fastify.log.info('Magic link token not found: ' + token)
      return
    }

    fastify.log.info('Magic link record: ' + JSON.stringify(tokenData))

    // ensure single use
    if (tokenData.verifiedAt || tokenData.failedValidationAt) {
      fastify.log.info('Magic link already consumed: ' + token)
      return
    }

    // ensure not expired
    if (tokenData.expiresAt < new Date()) {
      fastify.log.info('Magic link has expired: ' + token)
      await fastify.data.auth.failMagicToken(token)
      return
    }

    // Mark the email as verified in the database
    return await fastify.data.auth.consumeMagicToken(token)
  }

  async function findOrCreateUser(email: string) {
    let user = await fastify.data.users.findUserByEmail(email)
    if (!user) {
      user = await fastify.data.users.createUser(email)
      if (user) {
        await fastify.data.users.grantRole(user.id, 'user')
        await fastify.data.users.grantRole(user.id, 'member')
      } else {
        fastify.log.info(`User not found or created: ${email}`)
      }
    }
    return user
  }

  fastify.log.info('registered magic link plugin')
}

export default fp(magicLinkAuth, { name: 'magicLinkAuth', dependencies: ['db', 'resend', 'sessionAuth', 'turnstile', 'sensible', 'dataAccess'] })
