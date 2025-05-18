# System User Authentication

This document describes the implementation of API key-based authentication for system users in the WON platform.

## Overview

System users (bots) can authenticate using API keys instead of session tokens. This allows automated processes to interact with the API without requiring a user session.

## Implementation Details

### Database Schema

- Added a `system_bot` boolean column to the `users` table
- Created a new `api_keys` table to store API key information:
  - `id`: Primary key
  - `user_id`: Reference to the user who owns the key
  - `key_hash`: The API key hash
  - `description`: Optional description of the key's purpose
  - `created_at`: When the key was created
  - `last_used_at`: When the key was last used
  - `expires_at`: Optional expiration date
  - `revoked_at`: When the key was revoked (if applicable)

### API Key Format

API keys have the format: `{userId}.{randomPart}.{signature}`

- `userId`: The ID of the system user
- `randomPart`: A random string to make the key unique
- `signature`: HMAC-SHA256 signature of the payload using the JWT secret

### Authentication Flow

1. The client includes the API key in the `Authorization` header: `Authorization: Bearer {apiKey}`
2. The API key plugin extracts the API key from the header
3. The plugin verifies the API key signature
4. If valid, the plugin loads the user and checks if it's a system user
5. If successful, the plugin sets the session data for the request

### API Endpoints

- `POST /api/access/keys`: Generate a new API key (admin only)
- `GET /api/access/keys`: List API keys for a user (admin only)
- `DELETE /api/access/keys/{keyId}`: Revoke an API key (admin only)

## Security Considerations

- API keys are only available for system users (users with `system_bot=true`)
- Only administrators can manage API keys
- API keys can be revoked at any time
- API keys can have an expiration date
- The API key signature is verified using HMAC-SHA256 with the JWT secret

## Usage Example

```typescript
// Making a request with an API key
const response = await fetch('https://api.example.com/api/endpoint', {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
})
```
