import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { Resend } from 'resend'

const resend: FastifyPluginAsync = async (fastify, options) => {

  const resendAuth = new Resend(fastify.config.RESEND_AUTH_KEY)
  const resendFeedback = new Resend(fastify.config.RESEND_FEEDBACK_KEY)

  // ultimate flexibility
  fastify.decorate('resendAuth', resendAuth)
  fastify.decorate('resendFeedback', resendFeedback)

  // most common use case (?)
  fastify.decorate('sendAuthEmail', async (from: string, to: string, subject: string, htmlBody: string) => {
    fastify.log.info('sending auth email: ' + subject)
    const resendResponse = await resendAuth.emails.send({
      from,
      to,
      subject,
      html: htmlBody
    })
    fastify.log.info(JSON.stringify(resendResponse))
    return resendResponse
  })

  fastify.decorate('sendFeedbackEmail', async (from: string, to: string, subject: string, htmlBody: string) => {
    fastify.log.info('sending feedback email: ' + subject)
    const resendResponse = await resendFeedback.emails.send({
      from,
      to,
      subject,
      html: htmlBody
    })
    fastify.log.info(JSON.stringify(resendResponse))
    return resendResponse
  })

  fastify.log.info('registered resend plugin')
}

export default fp(resend, { name: 'resend', dependencies: ['env', 'sensible'] })
