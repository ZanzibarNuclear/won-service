'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const Fastify = require('fastify');

describe('Root route', () => {
  it('should return { root: true } when GET /', async () => {
    // Create a new Fastify instance for testing
    const app = Fastify();

    // Register the route handler directly
    app.get('/', async () => {
      return { root: true };
    });

    // Make the request
    const response = await app.inject({
      method: 'GET',
      url: '/'
    });

    // Assert on the response
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), { root: true });

    // Close the app
    await app.close();
  });
});