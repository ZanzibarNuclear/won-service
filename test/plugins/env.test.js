'use strict'

const { test } = require('node:test')
const assert = require('node:assert')

const Fastify = require('fastify')
const Support = require('../../src/plugins/env')

test('support works standalone', async (t) => {
  const fastify = Fastify()
  fastify.register(Support)

  await fastify.ready()
  assert.equal(fastify.API_BASE_URL, 'blargy')
})
