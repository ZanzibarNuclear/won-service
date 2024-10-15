import { FastifyPluginAsync } from "fastify";
import sensiblePlugin, { FastifySensibleOptions } from "@fastify/sensible";

const sensible: FastifyPluginAsync = async (fastify, options) => {
  fastify.register(sensiblePlugin, { errorHandler: false } as FastifySensibleOptions)
}

export default sensible;
