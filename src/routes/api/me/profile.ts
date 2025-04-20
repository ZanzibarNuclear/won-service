import { FastifyPluginAsync } from 'fastify'
import { ProfileUpdate } from './../../../types/won-flux-types';
import { roleGuard } from '../../../utils/roleGuard'
import { pipeline } from 'stream'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const pump = promisify(pipeline)

const profileRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get('/', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      fastify.log.info('find profile for current user')
      const profile = await fastify.data.userProfiles.get(request.session?.userId)
      if (!profile) {
        return reply.status(404).send()
      }
      return profile
    }
  })

  fastify.post('/', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      fastify.log.info('create profile for current user')
      const userId = request.session?.userId
      const body = request.body as { alias: string }
      return await fastify.data.userProfiles.create(userId, body.alias)
    }
  })

  fastify.put('/', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      fastify.log.info('update profile for current user')
      const userId = request.session?.userId
      const body = request.body as ProfileUpdate
      return await fastify.data.userProfiles.update(userId, body)
    }
  })

  fastify.get('/avatar', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.session?.userId
      const avatar = fastify.data.userProfiles
      const avatarPath = path.join(fastify.profileImagePath, userId, 'avatar.png')

      if (!fs.existsSync(avatarPath)) {
        return reply.status(404).send({ error: 'Avatar not found' })
      }

      return reply.sendFile(avatarPath) // Use fastify-static if configured
    }
  })

  fastify.post('/avatar', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const data = await request.file()
      if (!data || !['image/jpeg', 'image/png'].includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type' })
      }

      // Generate a unique filename (e.g., using UUID or user ID)
      const filepath = `${fastify.profileImagePath}/${request.session.userId}`
      const filename = `${Date.now()}-${data.filename}`

      const filePath = `${filepath}/${filename}`

      // Save file to disk (or process for S3 upload)
      await pump(data.file, fs.createWriteStream(filePath))

      // Return the file URL or metadata
      reply.send({ url: `/uploads/${filename}` })
    }
  })

}

export default profileRoutes
