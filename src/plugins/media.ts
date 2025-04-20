import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import multipart from '@fastify/multipart'
import fs from 'fs'
import path from 'path'

const media: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    }
  })

  await fastify.register(require('@fastify/static'), {
    root: fastify.config.IMAGE_STORAGE_PATH,
    prefix: fastify.config.IMAGE_ACCESS_ROOT
  })

  const imagePath = fastify.config.IMAGE_STORAGE_PATH
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image storage path does not exist: ${imagePath}`)
  }

  try {
    fs.accessSync(imagePath, fs.constants.W_OK)
  } catch (err) {
    throw new Error(`Image storage path is not writable: ${imagePath}`)
  }

  fastify.decorate('profileImagePath', imagePath)

  fastify.log.info('registered media plugin')
}

export default fp(media, { name: 'media' })
