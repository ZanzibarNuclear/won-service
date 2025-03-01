import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import { Resend } from 'resend'

const resend: FastifyPluginAsync = async (fastify, options) => {

  const resend = new Resend(fastify.config.RESEND_API_KEY)
  const resendFeedback = new Resend(fastify.config.RESEND_FEEDBACK_KEY)

  // ultimate flexibility
  fastify.decorate('resend', resend)

  // most common use case (?)
  fastify.decorate('sendEmail', async (from: string, to: string, subject: string, htmlBody: string) => {
    return await resend.emails.send({
      from,
      to,
      subject,
      html: htmlBody
    })
  })

  fastify.log.info('registered resend plugin')
}

export default fp(resend, { name: 'resend', dependencies: ['env', 'sensible'] })
