import jwt from 'jsonwebtoken'
import type { Session } from '../types/won-flux-types'

export function createSessionToken(user: any, secretKey: string): string {
  if (!secretKey) {
    throw new Error('Cannot create session tokens with secret key. Make sure that JWT_SECRET_KEY is set.')
  }

  const sessionInfo: Session = {
    userId: user.id,
    alias: user.alias,
    roles: ['member']
  }
  return jwt.sign(sessionInfo, secretKey, { expiresIn: '1d' })
}
