import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fastifyMongo from '@fastify/mongodb'
import { StorylineModel } from '../models/storyline.model'
import { ChapterModel } from '../models/chapter.model'
import { Storyline, Chapter } from '../models/storyline.schema'

interface StorylineParams {
  Params: { id: string }
}

interface ChapterBody {
  Body: Partial<Chapter>
}

interface StorylineBody {
  Body: Partial<Storyline>
}

const mongoModels: FastifyPluginAsync = async (fastify, options) => {
  try {
    await fastify.register(fastifyMongo, {
      forceClose: true,
      url: fastify.config.MONGO_URI,
      database: 'adventure',
    })
  } catch (err) {
    fastify.log.error('MongoDB connection error:', err)
    throw err
  }


  fastify.decorate("models", {
    storyline: null,
    chapter: null
  } as any)

  fastify.addHook('onReady', async function () {
    if (this.mongo && this.models) {
      this.models.storyline = new StorylineModel(this.mongo.db!)
      this.models.chapter = new ChapterModel(this.mongo.db!)
    }
  })

  fastify.get(
    '/api/adv/storylines',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.list()
      return reply.send(storylines)
    },
  )

  fastify.get(
    '/api/adv/storylines/:id',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const storylines = await fastify.models.storyline.findById(request.params.id)
      return reply.send(storylines)
    },
  )

  fastify.post<StorylineBody>(
    '/api/adv/storylines',
    async (request: FastifyRequest<StorylineBody>, reply: FastifyReply) => {
      const storyline = await fastify.models.storyline.create(request.body)
      return reply.code(201).send(storyline)
    },
  )

  fastify.post<StorylineParams & ChapterBody>(
    '/api/adv/storylines/:id/chapters',
    async (request: FastifyRequest<StorylineParams & ChapterBody>, reply: FastifyReply) => {
      const chapter = await fastify.models.storyline.addChapter(request.params.id, request.body)
      return reply.code(201).send(chapter)
    },
  )

  fastify.get<StorylineParams>(
    '/api/adv/storylines/:id/chapters',
    async (request: FastifyRequest<StorylineParams>, reply: FastifyReply) => {
      const chapters = await fastify.models.storyline.getChapters(request.params.id)
      return reply.send(chapters)
    },
  )
  fastify.log.info('registered mongo plugin')
}

export default fp(mongoModels, { name: 'mongoModels', dependencies: ['env'] })
