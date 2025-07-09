import fp from 'fastify-plugin'
import fastifyMongo from '@fastify/mongodb'
import { FastifyPluginAsync } from 'fastify'
import { StorylineModel } from '../models/storyline.model'
import { ChapterModel } from '../models/chapter.model'
import { SceneModel } from '../models/scene.model'
import { ContentModel } from '../models/content.model'
import { TransitionModel } from '../models/transition.model'

const mongoModels: FastifyPluginAsync = async (fastify, options) => {
  try {
    // Extract database name from connection URL
    const mongoUrl = fastify.config.MONGO_URL
    const dbName = mongoUrl.split('/').pop()?.split('?')[0] || 'adventure'

    await fastify.register(fastifyMongo, {
      forceClose: true,
      url: mongoUrl,
      database: dbName,
    })
    fastify.log.info(`Connected to mongo instance with database: ${dbName}`)
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
      this.models.scene = new SceneModel(this.mongo.db!)
      this.models.content = new ContentModel(this.mongo.db!)
      this.models.transition = new TransitionModel(this.mongo.db!)
    }
  })

  fastify.log.info('registered mongo plugin')
}

export default fp(mongoModels, { name: 'mongoModels', dependencies: ['env'] })
