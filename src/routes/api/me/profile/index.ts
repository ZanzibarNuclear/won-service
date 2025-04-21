import { FastifyPluginAsync } from 'fastify'
import { ProfileUpdate } from '../../../../types/won-flux-types';
import { roleGuard } from '../../../../utils/roleGuard'
import { pipeline } from 'stream'
import { promisify } from 'util'
import '@fastify/static'
import fs from 'fs'
import path from 'path'
import { adjustProfileImagePaths } from '../../../../utils'

const pump = promisify(pipeline)

const profileRoutes: FastifyPluginAsync = async (fastify, options) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp']

  const saveImage = async (userId: string, imageType: 'avatar' | 'glamShot', file: any, mimetype: string) => {
    const userDir = path.join(fastify.memberImageFilePath, userId)
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true })
    }

    const extension = mimetype.split('/')[1] // Extract file extension from mimetype
    const fileName = `${imageType}.${extension}`
    const imagePath = path.join(userDir, fileName)

    await pump(file, fs.createWriteStream(imagePath))

    // Update the database with the file name
    const relativePath = path.join(userId, fileName) + '?v=' + Date.now()
    if (imageType === 'avatar') {
      await fastify.data.userProfiles.updateAvatar(userId, relativePath)
    } else if (imageType === 'glamShot') {
      await fastify.data.userProfiles.updateGlamShot(userId, relativePath)
    }

    return relativePath
  }

  const removeImage = async (imagePath: string) => {
    if (!imagePath) {
      return
    }
    const cleanImagePath = imagePath.split('?')[0] // Remove query parameters
    const filePath = path.join(fastify.memberImageFilePath, cleanImagePath)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath) // Delete the file
      fastify.log.info('Image deleted: ' + filePath)
    } else {
      fastify.log.error('File not found: ' + filePath)
    }
  }

  const getImagePath = async (userId: string, imageType: 'avatar' | 'glamShot') => {
    const profile = await fastify.data.userProfiles.get(userId)
    const fileName = imageType === 'avatar' ? profile?.avatar : profile?.glam_shot
    return fileName ? path.join(fastify.memberImageFilePath, userId, fileName) : null
  }

  fastify.get('/', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      fastify.log.info('find profile for current user')

      const profile = await fastify.data.userProfiles.get(request.session?.userId)
      if (!profile) {
        return reply.status(404).send()
      }
      const adjusted = adjustProfileImagePaths(profile, fastify.memberImageViewPath)
      return adjusted
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

  fastify.post('/avatar', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.session?.userId
      const data = await request.file()

      if (!data || !allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type' })
      }

      const fileName = await saveImage(userId, 'avatar', data.file, data.mimetype)
      const freshProfile = await fastify.data.userProfiles.updateAvatar(userId, fileName)
      reply.send(freshProfile)
    }
  })

  fastify.get('/avatar', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.session?.userId
      const avatarPath = await getImagePath(userId, 'avatar')

      if (!avatarPath || !fs.existsSync(avatarPath)) {
        return reply.status(404).send({ error: 'Avatar not found' })
      }
      return reply.sendFile(avatarPath) // Requires fastify-static
    }
  })

  fastify.delete('/avatar', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.session?.userId
      const imagePath = await fastify.data.userProfiles.clearAvatar(userId)
      if (imagePath) {
        await removeImage(imagePath)
      }
      reply.code(201).send()
    }
  })

  fastify.post('/glam-shot', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.session?.userId
      const data = await request.file()

      if (!data || !allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type' })
      }

      const fileName = await saveImage(userId, 'glamShot', data.file, data.mimetype)
      const freshProfile = await fastify.data.userProfiles.updateGlamShot(userId, fileName)
      reply.send(freshProfile)
    }
  })

  fastify.get('/glam-shot', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.session?.userId
      const glamShotPath = await getImagePath(userId, 'glamShot')

      if (!glamShotPath || !fs.existsSync(glamShotPath)) {
        return reply.status(404).send({ error: 'Glam-shot not found' })
      }

      return reply.sendFile(glamShotPath) // Requires fastify-static
    }
  })

  fastify.delete('/glam-shot', {
    preHandler: roleGuard(['member']),
    handler: async (request, reply) => {
      const userId = request.session?.userId
      const imagePath = await fastify.data.userProfiles.clearGlamShot(userId)
      if (imagePath) {
        await removeImage(imagePath)
      }
      reply.code(201).send()
    }
  })
}

export default profileRoutes
