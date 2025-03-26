import { FastifyPluginAsync } from 'fastify'
import { JsonValue } from "../../../db/types"

const feedbackRoutes: FastifyPluginAsync = async (fastify, options) => {

  const DEFAULT_LIMIT = 10
  const MAX_LIMIT = 50

  fastify.get<{
    Querystring: {
      limit?: number
      offset?: number
      from?: string
      to?: string
      asc?: boolean
      user?: string
    }
  }>('/', async (request, reply) => {
    const { limit, offset, asc, from, to, user } = request.query

    fastify.log.info(`Fetching events: limit=${limit}, offset=${offset}, asc=${asc}, from=${from}, to=${to}, user=${user}`)

    // guard against returning too many
    let guardedLimit = DEFAULT_LIMIT
    if (limit && limit > 0) {
      guardedLimit = Math.min(limit, MAX_LIMIT)
      fastify.log.info(`Adjusting limit to ${guardedLimit}`)
    }

    const results = await fastify.data.feedback.get(guardedLimit, offset, { from, to, asc, user })

    return { items: results, total: results.length, hasMore: results.length === guardedLimit }
  })

  type eventPayload = {
    context: {
      sender?: string
      senderEmail?: string
      source: string
    }
    message: string
  }

  fastify.post('/', async (request, reply) => {
    const user_id = request.session?.userId
    const { context, message } = request.body as eventPayload

    try {
      await fastify.data.feedback.register(user_id, context, message)
      const { sender, senderEmail, source } = context

      // const contextAndMessage = `From: ${context.sender} <${context.senderEmail}>/nSource: ${context.source}/nKnown user: ${user_id}/n/n` + message

      const messageWithContext = `
From: ${context.sender} <${context.senderEmail}>
Source: ${context.source}
User: ${user_id || 'anonymous'}

${message}
      `
      await fastify.sendEmail(
        'World of Nuclear (system) <system@support.worldofnuclear.com>',
        fastify.config.ADMIN_EMAIL,
        `We got feedback. Hurray!!!`,
        messageWithContext
      )
    } catch (err) {
      fastify.log.error(err)
      reply.status(500).send('Sorry, something went wrong.')
      return
    }

    reply.status(201).send()
  })

}

export default feedbackRoutes
