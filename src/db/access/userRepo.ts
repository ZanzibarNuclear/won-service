import { Kysely } from "kysely"
import { DB } from '../types'
import { UserCredentials } from '../../types/won-flux-types'
import { NotFoundError, ConflictError } from '../../errors/AppError'
import { withErrorHandling, ensureExists } from '../../utils/errorHandling'

export class UserRepository {
  constructor(private db: Kysely<DB>) { }

  async createApiKey(userId: string, keyHash: string, description?: string, expiresAt?: Date) {
    // Check if user exists
    // TODO: create a guard for this
    const user = await this.getUser(userId)
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`, 'USER_NOT_FOUND', { userId })
    }

    // Store key
    return await this.db
      .insertInto('api_keys')
      .values({
        user_id: userId,
        key_hash: keyHash,
        description,
        expires_at: expiresAt
      })
      .returningAll()
      .executeTakeFirst()
  }

  async getApiKeys(userId: string) {
    // Check if user exists
    const user = await this.getUser(userId)
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`, 'USER_NOT_FOUND', { userId })
    }

    // fetch keys for system user
    return await this.db
      .selectFrom('api_keys')
      .selectAll()
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute()
  }

  async revokeApiKey(keyId: number) {
    const apiKey = await this.db
      .selectFrom('api_keys')
      .selectAll()
      .where('id', '=', keyId)
      .executeTakeFirst()

    if (!apiKey) {
      throw new NotFoundError(`API key with ID ${keyId} not found`, 'API_KEY_NOT_FOUND', { apiKey })
    }

    return await this.db
      .updateTable('api_keys')
      .set({
        revoked_at: new Date()
      })
      .where('id', '=', keyId)
      .returningAll()
      .executeTakeFirst()
  }

  async updateApiKeyLastUsed(keyId: number) {
    return await this.db
      .updateTable('api_keys')
      .set({
        last_used_at: new Date()
      })
      .where('id', '=', keyId)
      .execute()
  }

  async findUserByEmail(email: string) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where(eb => eb.fn('lower', ['email']), '=', email.toLowerCase())
      .executeTakeFirst()
  }

  async signInUser(email: string) {
    const user = await this.findUserByEmail(email)
    if (!user) {
      return null
    }
    return await this.db
      .updateTable('users')
      .set({
        last_sign_in_at: new Date()
      })
      .where('id', '=', user.id)
      .returningAll()
      .executeTakeFirst()
  }

  async createUser(email: string, system: boolean = false) {
    const user = await this.db
      .insertInto('users')
      .values({
        email: email,
        last_sign_in_at: new Date(),
        system_bot: system
      })
      .returningAll()
      .executeTakeFirst()

    // create an empty profile for new user
    if (user && !system) {
      await this.db
        .insertInto('user_profiles')
        .values({
          id: user.id
        })
        .execute()
    }

    return user
  }

  async getUser(id: string) {
    return await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }

  async getUsers(limit: number = 0, offset: number = 0) {
    const MAX_LIMIT = 100
    let query = this.db.selectFrom('users').selectAll()
    if (limit) {
      const adjustedLimit = limit > MAX_LIMIT ? MAX_LIMIT : limit
      query = query.limit(adjustedLimit)
    }
    if (offset) {
      query = query.offset(offset)
    }
    return await query.execute()
  }

  async grantRole(userId: string, role: string) {
    return withErrorHandling(
      async () => {
        // Check if user exists
        const user = await this.getUser(userId)
        ensureExists(
          user,
          NotFoundError,
          `User with ID ${userId} not found`,
          'USER_NOT_FOUND',
          { userId }
        )

        // Check if role exists
        const roleExists = await this.db
          .selectFrom('roles')
          .where('key', '=', role)
          .executeTakeFirst()

        ensureExists(
          roleExists,
          NotFoundError,
          `Role with key ${role} not found`,
          'ROLE_NOT_FOUND',
          { roleKey: role }
        )

        // Check if role is already granted
        const existingRole = await this.db
          .selectFrom('user_roles')
          .where('user_id', '=', userId)
          .where('role_id', '=', role)
          .executeTakeFirst()

        if (existingRole) {
          throw new ConflictError(
            `Role ${role} is already granted to user ${userId}`,
            'ROLE_ALREADY_GRANTED',
            { userId, roleKey: role }
          )
        }

        // Grant the role
        return await this.db
          .insertInto('user_roles')
          .values({
            user_id: userId,
            role_id: role,
          })
          .execute()
      },
      `Failed to grant role ${role} to user ${userId}`,
      'GRANT_ROLE_ERROR',
      { userId, roleKey: role }
    )
  }

  async revokeRole(userId: string, role: string) {
    return withErrorHandling(
      async () => {
        // Check if user exists
        const user = await this.getUser(userId)
        ensureExists(
          user,
          NotFoundError,
          `User with ID ${userId} not found`,
          'USER_NOT_FOUND',
          { userId }
        )

        // Check if role exists
        const roleExists = await this.db
          .selectFrom('roles')
          .where('key', '=', role)
          .executeTakeFirst()

        ensureExists(
          roleExists,
          NotFoundError,
          `Role with key ${role} not found`,
          'ROLE_NOT_FOUND',
          { roleKey: role }
        )

        // Check if the user has the role before revoking
        const existingRole = await this.db
          .selectFrom('user_roles')
          .where('user_id', '=', userId)
          .where('role_id', '=', role)
          .executeTakeFirst()

        ensureExists(
          existingRole,
          NotFoundError,
          `User ${userId} does not have role ${role}`,
          'ROLE_NOT_ASSIGNED',
          { userId, roleKey: role }
        )

        // Revoke the role
        return await this.db
          .deleteFrom('user_roles')
          .where('user_id', '=', userId)
          .where('role_id', '=', role)
          .execute()
      },
      `Failed to revoke role ${role} from user ${userId}`,
      'REVOKE_ROLE_ERROR',
      { userId, roleKey: role }
    )
  }

  async getUserRoles(userId: string) {
    return withErrorHandling(
      async () => {
        // Check if user exists
        const user = await this.getUser(userId)
        ensureExists(
          user,
          NotFoundError,
          `User with ID ${userId} not found`,
          'USER_NOT_FOUND',
          { userId }
        )

        return await this.db
          .selectFrom('user_roles')
          .selectAll()
          .where('user_id', '=', userId)
          .execute()
      },
      `Failed to get roles for user ${userId}`,
      'GET_USER_ROLES_ERROR',
      { userId }
    )
  }

  async getCreds(userId: string): Promise<UserCredentials> {
    return withErrorHandling(
      async () => {
        // Check if user exists
        const user = await this.getUser(userId)
        ensureExists(
          user,
          NotFoundError,
          `User with ID ${userId} not found`,
          'USER_NOT_FOUND',
          { userId }
        )

        const profile = await this.db
          .selectFrom('user_profiles')
          .select(['alias'])
          .where('id', '=', userId)
          .executeTakeFirst()

        const result = await this.getUserRoles(userId)
        const alias = profile?.alias || null
        const roles = result.map((row: any) => row.roleId)

        return {
          sub: userId,
          name: alias,
          role: roles
        }
      },
      `Failed to get credentials for user ${userId}`,
      'GET_USER_CREDS_ERROR',
      { userId }
    )
  }
}
