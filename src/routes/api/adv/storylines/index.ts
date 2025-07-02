import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Storyline } from '../../../../models/storyline.schema'

interface StorylineBody {
  Body: Partial<Storyline>
}

const storylineRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.list()
      return reply.send(storylines)
    },
  )

  fastify.post<StorylineBody>(
    '/',
    async (request: FastifyRequest<StorylineBody>, reply: FastifyReply) => {
      const storyline = await fastify.models.storyline.create(request.body)
      return reply.code(201).send(storyline)
    },
  )
}

export default storylineRoutes
