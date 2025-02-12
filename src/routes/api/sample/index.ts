import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import { userService } from './user.service'

// Schema definitions for request/response validation
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  age: Type.Optional(Type.Number())
})

const CreateUserSchema = Type.Omit(UserSchema, ['id'])
type User = Static<typeof UserSchema>
type CreateUser = Static<typeof CreateUserSchema>

// Error handling utility
const handleErrors = (reply: FastifyReply, error: any) => {
  if (error.code === 'NOT_FOUND') {
    reply.status(404).send({
      error: 'Resource not found',
      message: error.message
    })
  } else if (error.code === 'VALIDATION_ERROR') {
    reply.status(400).send({
      error: 'Validation error',
      message: error.message
    })
  } else {
    reply.status(500).send({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    })
  }
}

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /users/:id
  fastify.get<{ Params: { id: string } }>(
    '/users/:id',
    {
      schema: {
        params: Type.Object({
          id: Type.String()
        }),
        response: {
          200: UserSchema,
          404: Type.Object({
            error: Type.String(),
            message: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const user = await userService.findById(request.params.id)
        return user
      } catch (error) {
        handleErrors(reply, error)
      }
    }
  )

  // POST /users
  fastify.post<{ Body: CreateUser }>(
    '/users',
    {
      schema: {
        body: CreateUserSchema,
        response: {
          201: UserSchema,
          400: Type.Object({
            error: Type.String(),
            message: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const newUser = await userService.create(request.body)
        reply.status(201).send(newUser)
      } catch (error) {
        handleErrors(reply, error)
      }
    }
  )

  // PUT /users/:id
  fastify.put<{ Params: { id: string }; Body: CreateUser }>(
    '/users/:id',
    {
      schema: {
        params: Type.Object({
          id: Type.String()
        }),
        body: CreateUserSchema,
        response: {
          200: UserSchema,
          404: Type.Object({
            error: Type.String(),
            message: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const updatedUser = await userService.update(request.params.id, request.body)
        return updatedUser
      } catch (error) {
        handleErrors(reply, error)
      }
    }
  )

  // DELETE /users/:id
  fastify.delete<{ Params: { id: string } }>(
    '/users/:id',
    {
      schema: {
        params: Type.Object({
          id: Type.String()
        }),
        response: {
          204: Type.Null(),
          404: Type.Object({
            error: Type.String(),
            message: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        await userService.delete(request.params.id)
        reply.status(204).send()
      } catch (error) {
        handleErrors(reply, error)
      }
    }
  )
}