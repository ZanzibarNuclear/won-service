import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Storyline, Chapter } from '../../../../../../models/storyline.schema'

interface StorylineParams {
  Params: { storylineId: string }
}

interface ChapterBody {
  Body: Partial<Chapter>
}

const chaptersRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.post<StorylineParams & ChapterBody>(
    '/',
    async (request: FastifyRequest<StorylineParams & ChapterBody>, reply: FastifyReply) => {
      const chapter = await fastify.models.storyline.addChapter(request.params.storylineId, request.body)
      return reply.code(201).send(chapter)
    },
  )

  fastify.get<StorylineParams>(
    '/',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const chapters = await fastify.models.storyline.getChapters(request.params.storylineId)
      return reply.send(chapters)
    },
  )
}

export default chaptersRoutes
