import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Scene, ContentBlock } from '../../../../models/scene.schema'
import { ImageBlock, PassageBlock, VideoBlock } from '../../../../models/index-v1'

interface SceneParams {
  Params: { sceneId: string }
}

interface SceneBody {
  Body: Partial<Scene>
}

interface ContentParams {
  Params: { sceneId: string, contentId: string }
}

interface ContentBody {
  Body: Partial<ContentBlock>
}

const sceneRoutes: FastifyPluginAsync = async (fastify, options) => {
  // SCENE CRUD
  fastify.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const scenes = await fastify.models.scene.list()
      return reply.send(scenes)
    },
  )

  fastify.post<SceneBody>(
    '/',
    async (request: FastifyRequest<SceneBody>, reply: FastifyReply) => {
      const scene = await fastify.models.scene.create(request.body)
      return reply.code(201).send(scene)
    },
  )

  fastify.get<SceneParams>(
    '/:sceneId',
    async (request: FastifyRequest<SceneParams>, reply: FastifyReply) => {
      const scene = await fastify.models.scene.findById(request.params.sceneId)
      return reply.send(scene)
    },
  )

  fastify.patch<SceneParams & SceneBody>(
    '/:sceneId',
    async (request: FastifyRequest<SceneParams & SceneBody>, reply: FastifyReply) => {
      const scene = await fastify.models.scene.update(request.params.sceneId, request.body)
      return reply.send(scene)
    },
  )

  fastify.delete<SceneParams>(
    '/:sceneId',
    async (request: FastifyRequest<SceneParams>, reply: FastifyReply) => {
      await fastify.models.scene.delete(request.params.sceneId)
      return reply.code(204).send()
    },
  )

  // CONTENT CRUD (nested under scene)
  // TODO: decide if this is useful - leaning toward not
  // fastify.get<SceneParams>(
  //   '/:sceneId/content',
  //   async (request: FastifyRequest<SceneParams>, reply: FastifyReply) => {
  //     const contentList = await fastify.models.content.list(request.params.sceneId)
  //     return reply.send(contentList)
  //   },
  // )

  fastify.post<SceneParams & ContentBody>(
    '/:sceneId/content',
    async (request: FastifyRequest<SceneParams & ContentBody>, reply: FastifyReply) => {
      const blockType = request.body.type
      let content
      let block
      switch (blockType) {
        case 'passage':
          block = request.body as PassageBlock
          content = await fastify.models.scene.addPassageBlock(request.params.sceneId, block)
          break
        case 'image':
          block = request.body as ImageBlock
          content = await fastify.models.scene.addImageBlock(request.params.sceneId, block)
          break
        case 'video':
          block = request.body as VideoBlock
          content = await fastify.models.scene.addVideoBlock(request.params.sceneId, block)
          break
        default:
          fastify.log.warn('Unknown content block type.')
      }
      return reply.code(201).send(content)
    },
  )

  fastify.get<ContentParams>(
    '/:sceneId/content/:contentId',
    async (request: FastifyRequest<ContentParams>, reply: FastifyReply) => {
      const content = await fastify.models.content.getBlock(request.params.sceneId, request.params.contentId)
      return reply.send(content)
    },
  )

  fastify.patch<ContentParams & ContentBody>(
    '/:sceneId/content/:contentId',
    async (request: FastifyRequest<ContentParams & ContentBody>, reply: FastifyReply) => {
      const content = await fastify.models.content.updateBlock(request.params.sceneId, request.params.contentId, request.body)
      return reply.send(content)
    },
  )

  fastify.delete<ContentParams>(
    '/:sceneId/content/:contentId',
    async (request: FastifyRequest<ContentParams>, reply: FastifyReply) => {
      await fastify.models.content.deleteBlock(request.params.sceneId, request.params.contentId)
      return reply.code(204).send()
    },
  )
}

export default sceneRoutes
