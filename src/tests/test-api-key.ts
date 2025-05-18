import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

// This script demonstrates how to use API keys for system users

async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000'
  const adminToken = process.env.ADMIN_TOKEN // You'll need to set this with a valid admin session token

  if (!adminToken) {
    console.error('Please set ADMIN_TOKEN environment variable with a valid admin session token')
    process.exit(1)
  }

  try {
    // 1. First, get the system user ID (the robot user)
    const usersResponse = await axios.get(`${baseUrl}/api/v1/users?alias=robotNanny`, {
      headers: {
        Cookie: `session_token=${adminToken}`
      }
    })

    const robotUser = usersResponse.data.users.find((user: any) => user.system_bot)

    if (!robotUser) {
      console.error('Robot user not found')
      process.exit(1)
    }

    console.log('Found robot user:', robotUser.id)

    // 2. Generate an API key for the robot user
    const apiKeyResponse = await axios.post(`${baseUrl}/api/v1/api-keys`, {
      userId: robotUser.id,
      description: 'Test API key'
    }, {
      headers: {
        Cookie: `session_token=${adminToken}`
      }
    })

    const apiKey = apiKeyResponse.data.apiKey
    console.log('Generated API key:', apiKey)

    // 3. Test the API key by making a request
    const testResponse = await axios.get(`${baseUrl}/api/about`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })

    console.log('Test response:', testResponse.data)

    // 4. List all API keys for the robot user
    const listKeysResponse = await axios.get(`${baseUrl}/api/v1/api-keys?userId=${robotUser.id}`, {
      headers: {
        Cookie: `session_token=${adminToken}`
      }
    })

    console.log('API keys:', listKeysResponse.data.apiKeys)

    // 5. Revoke the API key
    const keyId = listKeysResponse.data.apiKeys[0].id
    const revokeResponse = await axios.delete(`${baseUrl}/api/v1/api-keys/${keyId}`, {
      headers: {
        Cookie: `session_token=${adminToken}`
      }
    })

    console.log('Revoke response:', revokeResponse.data)

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message)
  }
}

main()