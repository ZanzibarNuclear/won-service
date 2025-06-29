import fp from 'fastify-plugin'
import fastifyMongo from '@fastify/mongodb'
import { FastifyPluginAsync } from 'fastify'
import { StorylineModel } from '../models/storyline.model'
import { ChapterModel } from '../models/chapter.model'

const mongoModels: FastifyPluginAsync = async (fastify, options) => {
  try {
    await fastify.register(fastifyMongo, {
      forceClose: true,
      url: fastify.config.MONGO_URI,
      database: 'adventure',
    })
    fastify.log.info('Connected to mongo instance')
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

  fastify.log.info('registered mongo plugin')
}

export default fp(mongoModels, { name: 'mongoModels', dependencies: ['env'] })
