import { FastifyPluginAsync } from 'fastify'

const cookiesPlugin: FastifyPluginAsync = async (fastify, options) => {
  fastify.register(require('@fastify/cookie'), {
    secret: "nuclearRocks37#", // for cookies signature
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {}  // options for parsing cookies
  })
}

export default cookiesPlugin