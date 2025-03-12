const fastify = require('fastify')({ logger: true });
const oauthPlugin = require('@fastify/oauth2');

// Register OAuth providers
fastify.register(oauthPlugin, {
  name: 'googleOAuth2',
  credentials: {
    client: { id: '<GOOGLE_CLIENT_ID>', secret: '<GOOGLE_CLIENT_SECRET>' },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/login/google',
  callbackUri: 'http://localhost:3000/login/google/callback',
});

fastify.register(oauthPlugin, {
  name: 'facebookOAuth2',
  credentials: {
    client: { id: '<FACEBOOK_CLIENT_ID>', secret: '<FACEBOOK_CLIENT_SECRET>' },
    auth: oauthPlugin.FACEBOOK_CONFIGURATION,
  },
  startRedirectPath: '/login/facebook',
  callbackUri: 'http://localhost:3000/login/facebook/callback',
});

fastify.register(oauthPlugin, {
  name: 'discordOAuth2',
  credentials: {
    client: { id: '<DISCORD_CLIENT_ID>', secret: '<DISCORD_CLIENT_SECRET>' },
    auth: oauthPlugin.DISCORD_CONFIGURATION,
  },
  startRedirectPath: '/login/discord',
  callbackUri: 'http://localhost:3000/login/discord/callback',
});

fastify.register(oauthPlugin, {
  name: 'xOAuth2',
  credentials: {
    client: { id: '<X_CLIENT_ID>', secret: '<X_CLIENT_SECRET>' },
    auth: {
      authorizeHost: 'https://api.twitter.com',
      authorizePath: '/oauth/authorize',
      tokenHost: 'https://api.twitter.com',
      tokenPath: '/oauth/access_token',
    },
  },
  startRedirectPath: '/login/x',
  callbackUri: 'http://localhost:3000/login/x/callback',
});

// Callback endpoints for each provider
fastify.get('/login/:provider/callback', async function (request, reply) {
  const provider = request.params.provider;
  const { token } = await this[`${provider}OAuth2`].getAccessTokenFromAuthorizationCodeFlow(request);

  // Send access token back to frontend
  reply.send({ access_token: token.access_token });
});
