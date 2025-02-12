// const fastify = require('fastify')()

// await fastify.register(require('@fastify/swagger'), {
//   openapi: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Test swagger',
//       description: 'Testing the Fastify swagger API',
//       version: '0.1.0'
//     },
//     servers: [
//       {
//         url: 'http://localhost:3000',
//         description: 'Development server'
//       }
//     ],
//     tags: [
//       { name: 'user', description: 'User related end-points' },
//       { name: 'code', description: 'Code related end-points' }
//     ],
//     components: {
//       securitySchemes: {
//         apiKey: {
//           type: 'apiKey',
//           name: 'apiKey',
//           in: 'header'
//         }
//       }
//     },
//     externalDocs: {
//       url: 'https://swagger.io',
//       description: 'Find more info here'
//     }
//   }
// })

// fastify.put('/some-route/:id', {
//   schema: {
//     description: 'post some data',
//     tags: ['user', 'code'],
//     summary: 'qwerty',
//     security: [{ apiKey: [] }],
//     params: {
//       type: 'object',
//       properties: {
//         id: {
//           type: 'string',
//           description: 'user id'
//         }
//       }
//     },
//     body: {
//       type: 'object',
//       properties: {
//         hello: { type: 'string' },
//         obj: {
//           type: 'object',
//           properties: {
//             some: { type: 'string' }
//           }
//         }
//       }
//     },
//     response: {
//       201: {
//         description: 'Successful response',
//         type: 'object',
//         properties: {
//           hello: { type: 'string' }
//         }
//       },
//       default: {
//         description: 'Default response',
//         type: 'object',
//         properties: {
//           foo: { type: 'string' }
//         }
//       }
//     }
//   }
// }, (req, reply) => { })
