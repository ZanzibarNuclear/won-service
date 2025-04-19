import { FastifyReply, FastifyRequest } from 'fastify'

export function roleGuard(requiredRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.session?.userId) {
      return reply.status(401).send({ error: 'Not authenticated' })
    }

    const userRoles = request.session.roles || []
    const hasRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRole) {
      return reply.status(403).send({ error: 'Forbidden: Insufficient permissions' })
    }
  }
}