import jwt from 'jsonwebtoken'
import type { Session } from '../types/session'

const SECRET_KEY = process.env.JWT_SECRET_KEY

export function createSessionToken(user: any): string {
  if (!SECRET_KEY) {
    throw new Error('Cannot create session tokens. JWT_SECRET_KEY is not set.')
  }

  const sessionInfo: Session = {
    userId: user.id,
    alias: user.alias,
    roles: ['member']
  }
  return jwt.sign(sessionInfo, SECRET_KEY, { expiresIn: '1d' })
}
