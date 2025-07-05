import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Storyline, Chapter } from '../../../../models/storyline.schema'

// Helper function to check if user is the author of the storyline
async function checkAuthorAuthorization(fastify: any, storylineId: string, userId: string): Promise<boolean> {
  const storyline = await fastify.models.storyline.findById(storylineId)
  if (!storyline) return false
  return storyline.author === userId
}

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
      const userId = request.userId
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' })
      request.body.author = userId
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
      const userId = request.userId
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

      const isAuthor = await checkAuthorAuthorization(fastify, request.params.slId, userId)
      if (!isAuthor) return reply.code(403).send({ error: 'Forbidden: Only the author can update this storyline' })

      const storylines = await fastify.models.storyline.updateStoryline(request.params.slId, request.body)
      return reply.send(storylines)
    },
  )

  fastify.put(
    '/:slId/publish',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const userId = request.userId
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

      const isAuthor = await checkAuthorAuthorization(fastify, request.params.slId, userId)
      if (!isAuthor) return reply.code(403).send({ error: 'Forbidden: Only the author can publish this storyline' })

      const storyline = await fastify.models.storyline.publishStoryline(request.params.slId)
      return reply.send(storyline)
    },
  )

  fastify.put(
    '/:slId/unpublish',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const userId = request.userId
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

      const isAuthor = await checkAuthorAuthorization(fastify, request.params.slId, userId)
      if (!isAuthor) return reply.code(403).send({ error: 'Forbidden: Only the author can unpublish this storyline' })

      const storyline = await fastify.models.storyline.unpublishStoryline(request.params.slId)
      return reply.send(storyline)
    },
  )

  fastify.post<StorylineParams & ChapterBody>(
    '/:slId/chapters',
    async (request: FastifyRequest<StorylineParams & ChapterBody>, reply: FastifyReply) => {
      const userId = request.userId
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

      const isAuthor = await checkAuthorAuthorization(fastify, request.params.slId, userId)
      if (!isAuthor) return reply.code(403).send({ error: 'Forbidden: Only the author can add chapters to this storyline' })

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
      const userId = request.userId
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

      const isAuthor = await checkAuthorAuthorization(fastify, request.params.slId, userId)
      if (!isAuthor) return reply.code(403).send({ error: 'Forbidden: Only the author can update this chapter' })

      const chapters = await fastify.models.chapter.update(request.params.slId, request.params.chId, request.body)
      return reply.send(chapters)
    },
  )

}

export default storylineRoutes
