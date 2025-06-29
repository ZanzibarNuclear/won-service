import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Storyline, Chapter } from '../../../models/storyline.schema'

interface StorylineParams {
  Params: { id: string }
}

interface ChapterParams {
  Params: {
    storylineId: string,
    chapterId: string
  }
}

interface ChapterBody {
  Body: Partial<Chapter>
}

interface StorylineBody {
  Body: Partial<Storyline>
}

const adventureRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get(
    '/storylines',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.list()
      return reply.send(storylines)
    },
  )

  fastify.get(
    '/storylines/:id',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.findById(request.params.id)
      return reply.send(storylines)
    },
  )

  fastify.patch(
    '/storylines/:id',
    async (request: FastifyRequest<StorylineParams & StorylineBody>, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.updateStoryline(request.params.id, request.body)
      return reply.send(storylines)
    },
  )

  fastify.post<StorylineBody>(
    '/storylines',
    async (request: FastifyRequest<StorylineBody>, reply: FastifyReply) => {
      const storyline = await fastify.models.storyline.create(request.body)
      return reply.code(201).send(storyline)
    },
  )

  fastify.post<StorylineParams & ChapterBody>(
    '/storylines/:id/chapters',
    async (request: FastifyRequest<StorylineParams & ChapterBody>, reply: FastifyReply) => {
      const chapter = await fastify.models.storyline.addChapter(request.params.id, request.body)
      return reply.code(201).send(chapter)
    },
  )

  fastify.get<StorylineParams>(
    '/storylines/:id/chapters',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const chapters = await fastify.models.storyline.getChapters(request.params.id)
      return reply.send(chapters)
    },
  )

  fastify.get<ChapterParams>(
    '/storylines/:storylineId/chapters/:chapterId',
    async (request: FastifyRequest<ChapterParams>, reply: FastifyReply) => {
      const chapters = await fastify.models.chapter.getById(request.params.storylineId, request.params.chapterId)
      return reply.send(chapters)
    },
  )

  fastify.patch<ChapterParams & ChapterBody>(
    '/storylines/:storylineId/chapters/:chapterId',
    async (request: FastifyRequest<ChapterParams & ChapterBody>, reply: FastifyReply) => {
      const chapters = await fastify.models.chapter.update(request.params.storylineId, request.params.chapterId, request.body)
      return reply.send(chapters)
    },
  )

}

export default adventureRoutes
