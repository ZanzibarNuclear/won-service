import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import mongoPlugin from '@fastify/mongodb'
// import fastifyMongoose from 'fastify-mongoose'

const mongo: FastifyPluginAsync = async (fastify, options) => {
  try {
    await fastify.register(fastifyMongoose, {
      uri: fastify.config.MONGO_URI,
    })

    //   await fastify.register(mongoPlugin, {
    //     forceClose: true,
    //     url: fastify.config.MONGO_URI,
    //     database: 'adventure',
    //   })

    //   // Expose collections for convenience
    //   const db = fastify.mongo.db!
    //   fastify.decorate('mongoCollections', {
    //     adventures: db.collection('adventures'),
    //     campaigns: db.collection('campaigns'),
    //     players: db.collection('players'),
    //     items: db.collection('items'),
    //     game_maps: db.collection('players'),
    //     events: db.collection('events')
    //   })
    // } catch (err) {
    //   fastify.log.error('MongoDB connection error:', err)
    //   throw err
    // }
    fastify.log.info('registered mongo plugin')
  }

export default fp(mongo, { name: 'mongo', dependencies: ['env'] })

  const sample = {
    adventure: {
      storyline: {
        title: 'A',
        descriptoin: 'All about A.',
        createdAt: new Date(),
        publishedAt: null,
        archivedAt: null,

      }
    }
  }