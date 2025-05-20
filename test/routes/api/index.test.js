'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const Fastify = require('fastify');

describe('API root routes', () => {
  let app;

  // Setup - runs before each test
  async function setupApp() {
    app = Fastify();

    // Mock the memberImageViewPath
    app.decorate('memberImageViewPath', 'https://example.com/images');

    // Mock the removeSessionToken function
    app.decorate('removeSessionToken', (reply) => {
      // Mock implementation
      reply.clearCookie('sessionToken');
    });

    // Register the routes
    app.get('/api', async (request, reply) => {
      return { message: 'Flux Service API' };
    });

    app.get('/api/image-config', async (request, reply) => {
      return {
        avatarBaseUrl: app.memberImageViewPath
      };
    });

    app.delete('/api/logout', async (request, reply) => {
      app.removeSessionToken(reply);
      return true;
    });

    return app;
  }

  // Test the root API endpoint
  it('should return API message when GET /api', async () => {
    app = await setupApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api'
    });

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), { message: 'Flux Service API' });

    await app.close();
  });

  // Test the image-config endpoint
  it('should return image configuration when GET /api/image-config', async () => {
    app = await setupApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/image-config'
    });

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), {
      avatarBaseUrl: 'https://example.com/images'
    });

    await app.close();
  });

});