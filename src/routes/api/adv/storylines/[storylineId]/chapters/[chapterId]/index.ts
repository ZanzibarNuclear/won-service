import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Storyline, Chapter } from '../../../../../../../models/storyline.schema'

interface ChapterParams {
  Params: {
    storylineId: string,
    chapterId: string
  }
}

interface ChapterBody {
  Body: Partial<Chapter>
}

const storylineRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get<ChapterParams>(
    '/',
    async (request: FastifyRequest<ChapterParams>, reply: FastifyReply) => {
      const chapters = await fastify.models.chapter.getById(request.params.storylineId, request.params.chapterId)
      return reply.send(chapters)
    },
  )

  fastify.patch<ChapterParams & ChapterBody>(
    '/',
    async (request: FastifyRequest<ChapterParams & ChapterBody>, reply: FastifyReply) => {
      const chapters = await fastify.models.chapter.update(request.params.storylineId, request.params.chapterId, request.body)
      return reply.send(chapters)
    },
  )
}

export default storylineRoutes
