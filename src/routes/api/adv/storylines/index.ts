import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Storyline, Chapter } from '../../../../models/storyline.schema'

interface StorylineParams {
  Params: { slId: string }
}

interface ChapterParams {
  Params: {
    slId: string,
    chId: string
  }
}

interface ChapterBody {
  Body: Partial<Chapter>
}

interface StorylineBody {
  Body: Partial<Storyline>
}

const storylineRoutes: FastifyPluginAsync = async (fastify, options) => {

  fastify.get(
    '',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.list()
      return reply.send(storylines)
    },
  )

  fastify.post<StorylineBody>(
    '',
    async (request: FastifyRequest<StorylineBody>, reply: FastifyReply) => {
      const storyline = await fastify.models.storyline.create(request.body)
      return reply.code(201).send(storyline)
    },
  )

  fastify.get(
    '/:slId',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.findById(request.params.slId)
      return reply.send(storylines)
    },
  )

  fastify.patch(
    '/:slId',
    async (request: FastifyRequest<StorylineParams & StorylineBody>, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.updateStoryline(request.params.slId, request.body)
      return reply.send(storylines)
    },
  )

  fastify.post<StorylineParams & ChapterBody>(
    '/:slId/chapters',
    async (request: FastifyRequest<StorylineParams & ChapterBody>, reply: FastifyReply) => {
      const chapter = await fastify.models.storyline.addChapter(request.params.slId, request.body)
      return reply.code(201).send(chapter)
    },
  )

  fastify.get<StorylineParams>(
    '/:slId/chapters',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const chapters = await fastify.models.storyline.getChapters(request.params.slId)
      return reply.send(chapters)
    },
  )

  fastify.get<ChapterParams>(
    '/:slId/chapters/:chId',
    async (request: FastifyRequest<ChapterParams>, reply: FastifyReply) => {
      const chapters = await fastify.models.chapter.getById(request.params.slId, request.params.chId)
      return reply.send(chapters)
    },
  )

  fastify.patch<ChapterParams & ChapterBody>(
    '/:slId/chapters/:chId',
    async (request: FastifyRequest<ChapterParams & ChapterBody>, reply: FastifyReply) => {
      const chapters = await fastify.models.chapter.update(request.params.slId, request.params.chId, request.body)
      return reply.send(chapters)
    },
  )

}

export default storylineRoutes
