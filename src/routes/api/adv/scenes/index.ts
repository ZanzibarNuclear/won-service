import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { Scene, ContentBlock, ImageBlock, PassageBlock, VideoBlock, Transition } from '../../../../models/scene.schema'

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

interface TransitionParams {
  Params: { sceneId: string, transitionId: string }
}

interface TransitionBody {
  Body: Partial<Transition>
}

const sceneRoutes: FastifyPluginAsync = async (fastify, options) => {
  fastify.get(
    '',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { chapterId } = request.query as { chapterId?: string }
      if (!chapterId) {
        return reply.code(400).send({ error: 'chapterId is required as a query parameter' })
      }
      const scenes = await fastify.models.scene.list(chapterId)
      return reply.send(scenes)
    },
  )

  fastify.post<SceneBody>(
    '',
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
      if (!content) {
        return reply.code(404).send({ error: 'content block with that ID not found' })
      }
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

  fastify.post<SceneParams & { Body: Transition }>(
    '/:sceneId/transitions',
    async (request: FastifyRequest<SceneParams & { Body: Transition }>, reply: FastifyReply) => {
      const { sceneId } = request.params
      const { toSceneId, label, prompt } = request.body
      if (!toSceneId || !label || !prompt) {
        return reply.code(400).send({ error: 'toSceneId, label and prompt are required' })
      }
      const transition = await fastify.models.scene.addTransition(sceneId, { toSceneId, label, prompt })
      return reply.code(201).send(transition)
    },
  )

  fastify.get<TransitionParams>(
    '/:sceneId/transitions/:transitionId',
    async (request: FastifyRequest<TransitionParams>, reply: FastifyReply) => {
      const { sceneId, transitionId } = request.params
      const transitions = await fastify.models.transition.get(sceneId, transitionId)
      return reply.send(transitions)
    },
  )

  fastify.patch<SceneParams & { Body: Partial<Transition> } & { Params: { sceneId: string, transitionId: string } }>(
    '/:sceneId/transitions/:transitionId',
    async (request: FastifyRequest<{ Params: { sceneId: string, transitionId: string }, Body: Partial<Transition> }>, reply: FastifyReply) => {
      const { sceneId, transitionId } = request.params
      const updated = await fastify.models.transition.update(sceneId, transitionId, request.body)
      return reply.send(updated)
    },
  )

  fastify.delete<{ Params: { sceneId: string, transitionId: string } }>(
    '/:sceneId/transitions/:transitionId',
    async (request: FastifyRequest<{ Params: { sceneId: string, transitionId: string } }>, reply: FastifyReply) => {
      const { sceneId, transitionId } = request.params
      await fastify.models.transition.delete(sceneId, transitionId)
      return reply.code(204).send()
    },
  )
}

export default sceneRoutes
