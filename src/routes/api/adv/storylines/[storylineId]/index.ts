import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Storyline, Chapter } from '../../../../../models/storyline.schema'

interface StorylineParams {
  Params: { slId: string }
}

interface StorylineBody {
  Body: Partial<Storyline>
}

const oneStorylineRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get('/',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.findById(request.params.slId)
      return reply.send(storylines)
    },
  )

  fastify.patch('/',
    async (request: FastifyRequest<StorylineParams & StorylineBody>, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.updateStoryline(request.params.slId, request.body)
      return reply.send(storylines)
    },
  )
}

export default oneStorylineRoutes
