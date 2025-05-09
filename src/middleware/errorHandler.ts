import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError, DatabaseError, NotFoundError, ValidationError, ConflictError, UnauthorizedError, ForbiddenError } from '../errors/AppError'

/**
 * Global error handler middleware for Fastify
 * Standardizes error responses across the API
 */
export default function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error)

  // Handle our custom AppError types
  if (error instanceof AppError) {
    const response = {
      status: 'error',
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV !== 'production' && error.context && { context: error.context })
    }

    return reply.status(error.statusCode).send(response)
  }

  // Handle Fastify validation errors
  if (error.validation) {
    const response = {
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: error.validation
    }

    return reply.status(400).send(response)
  }

  // Handle other Fastify errors with statusCode
  if ('statusCode' in error && error.statusCode) {
    const response = {
      status: 'error',
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message
    }

    return reply.status(error.statusCode).send(response)
  }

  // Default error response for unhandled errors
  const response = {
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message || 'Unknown error'
  }

  return reply.status(500).send(response)
}