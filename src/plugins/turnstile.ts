import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'

const turnstilePlugin: FastifyPluginAsync = async (fastify, options) => {
  const validateTurnstile = async (turnstileToken: string, ipAddress: string) => {
    fastify.log.info(`validateTurnstile: ${turnstileToken} ${ipAddress}`)
    const response = await fetch(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
      method: 'POST',
      body: JSON.stringify({ secret: fastify.config.TURNSTILE_SECRET_KEY, response: turnstileToken, remoteip: ipAddress }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    fastify.log.info(`validateTurnstile: response=${response}`)
    return await response.json() as Promise<{ success: boolean }>
  }

  fastify.decorate('validateTurnstile', validateTurnstile)
}


export default fp(turnstilePlugin, { name: 'turnstile', dependencies: ['env'] })