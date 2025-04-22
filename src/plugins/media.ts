import fp from 'fastify-plugin'
import { FastifyPluginAsync } from "fastify"
import multipart from '@fastify/multipart'
import fs from 'fs'
import path from 'path'

const media: FastifyPluginAsync = async (fastify, options) => {
  const filePath = fastify.config.MEMBER_IMAGE_FILE_PATH
  const viewPath = fastify.config.MEMBER_IMAGE_VIEW_PATH

  fastify.decorate('memberImageFilePath', filePath)
  fastify.decorate('memberImageViewPath', viewPath)

  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    }
  })

  await fastify.register(require('@fastify/static'), {
    root: filePath,
    prefix: viewPath
  })

  if (!fs.existsSync(filePath)) {
    throw new Error(`Image storage path does not exist: ${filePath}`)
  }

  try {
    fs.accessSync(filePath, fs.constants.W_OK)
  } catch (err) {
    throw new Error(`Image storage path is not writable: ${filePath}`)
  }

  fastify.log.info('registered media plugin')
}

export default fp(media, { name: 'media' })
