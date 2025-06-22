import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import mongoPlugin from '@fastify/mongodb'

const mongo: FastifyPluginAsync = async (fastify, options) => {
  try {
    await fastify.register(mongoPlugin, {
      forceClose: true,
      url: fastify.config.MONGO_URI,
      database: 'adventure',
    })

    // Expose collections for convenience
    const db = fastify.mongo.db!
    fastify.decorate('mongoCollections', {
      storylines: db.collection('storylines'),
      scenes: db.collection('scenes'),
      campaigns: db.collection('campaigns'),
      players: db.collection('players'),
      items: db.collection('items'),
      zones: db.collection('zones'),
      rooms: db.collection('rooms'),
      npcs: db.collection('npcs'),
      events: db.collection('events')
    })
  } catch (err) {
    fastify.log.error('MongoDB connection error:', err)
    throw err
  }
  fastify.log.info('registered mongo plugin')
}

export default fp(mongo, { name: 'mongo', dependencies: ['env'] })
