# API for Auth Service and Flux Service

This is the backing API that supports user authentication and authorization, as well as the
World of Nuclear Flux service.

## Architecture

These micro-services are built using Fastify, a web framework that is designed to be fast and efficient.
If these work out, we can always separate them into their own endpoints and even projects. Until then,
let's keep this simple and efficient.

Behind these services is a PostgreSQL database for data persistence. This project has code for database
schema migrations, using Kysely, as well as code for setting up database instances and roles.

For hosted environments (as opposed to local development), we front these services with nginx. This
allows us to manage traffic, apply security policies, and support a highly available configuration.
We use nginx for SSL termination, as well as for load balancing and routing to separate instances:
staging, production, etc.

## Plugins

Some of the plugins are used as is: cookie, cors, env and sensible. OAuth2 and sessionAuth are customized to handle OAuth2 and session handling.

## Security

### JWT Secret Key

The application uses JWT for authentication. A strong JWT secret key is required for security:

- In development: Minimum 32 characters with a mix of uppercase, lowercase, numbers, and special characters
- In production: Minimum 48 characters with higher entropy requirements

To generate a secure JWT secret key, use the provided script:

```bash
# Generate a 48-character secure secret
node scripts/generate-secret.js

# Or specify a custom length (minimum 32)
node scripts/generate-secret.js 64
```

Add the generated key to your `.env` file:

```
JWT_SECRET_KEY=your_generated_secret_here
```

The application validates the strength of security-critical secrets at startup and will:

- Warn about weak secrets in development
- Prevent startup with weak secrets in production

### Environment Variables

Security-critical environment variables:

- `JWT_SECRET_KEY`: Secret for signing JWT tokens
- `COOKIE_SECRET`: Secret for cookie signing
- `DATABASE_URL`: Database connection string (should use SSL in production)
- Various OAuth client secrets

Never commit these values to version control. Use environment variables or a secure secrets management solution.

## Getting Started

When you are ready to test, be sure to try a local build.

```bash
# Install dependencies
npm install

# Generate a secure JWT secret
node scripts/generate-secret.js >> .env

# Build the application
npm run build

# Start the server
node dist/index.js
```

## Testing

The project includes tests for various components:

```bash
# Run all JavaScript tests
npm test

# Run tests for utility functions (requires build first)
npm run test:utils

# Run all tests (JavaScript and TypeScript)
npm run test:all
```

### Security Tests

The security utilities include tests to verify:

- JWT secret key validation
- Secure secret generation
- Entropy checking

To run the security-related tests:

```bash
npm run test:utils
```

## Branching Strategy

- feature-branch - for working on changes; might be broken at any moment, needs to work to merge into staging branch
- main - production ready code OR the latest code that runs - good for testing, staging
- release branch - for production

- dev/feature branches
- staging - tag RCs (same as main?)
- release - tag releases
