import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'

export function createSessionToken(user: any): string {
  return jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1d' })
}
