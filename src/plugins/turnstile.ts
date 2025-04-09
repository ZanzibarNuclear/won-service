import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'

type TurnstileErrorCodes = 'missing-input-secret' | 'invalid-input-secret' | 'missing-input-response' | 'invalid-input-response' | 'bad-request' | 'timeout-or-duplicate' | 'internal-error'
type TurnstileResponse = {
  success: boolean
  challenge_ts: string
  hostname: string
  "error-codes": TurnstileErrorCodes[]
  action: string
  cdata: string
  metadata: {
    ephemeral_id: string
  }
}

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

    // FIXME: this may be the wrong way to handle
    fastify.log.info(`validateTurnstile: response=${response}`)
    const responseDetails: TurnstileResponse = await response.json()
    if (!responseDetails.success) {
      fastify.log.warn('Fastify error: ' + responseDetails['error-codes'].join(', '))
      return responseDetails
    }
    return responseDetails
  }

  fastify.decorate('validateTurnstile', validateTurnstile)
}


export default fp(turnstilePlugin, { name: 'turnstile', dependencies: ['env'] })