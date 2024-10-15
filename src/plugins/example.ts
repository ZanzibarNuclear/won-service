import { FastifyPluginAsync } from 'fastify'

const examplePlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.decorate('exampleUtil', () => {
    return 'This is an example utility'
  })
}

export default examplePlugin