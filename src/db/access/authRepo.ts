import { Kysely } from "kysely"
import { DB } from '../types'

export class AuthRepository {
  constructor(private db: Kysely<DB>) { }

  async findMagicToken(token: string) {
    // NOTE: different pattern of throwing when not found
    return await this.db
      .selectFrom('magic_auth')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirstOrThrow()
  }

  async failMagicToken(token: string) {
    return await this.db
      .updateTable('magic_auth')
      .set({
        failed_validation_at: new Date()
      })
      .where('token', '=', token)
      .execute()
  }

  async consumeMagicToken(token: string) {
    return await this.db
      .updateTable('magic_auth')
      .set({
        verified_at: new Date()
      })
      .where('token', '=', token)
      .returningAll()
      .executeTakeFirst()
  }

  async findIdentity(userId: string, provider: string) {
    return await this.db
      .selectFrom('identities')
      .where('user_id', '=', userId)
      .where('provider', '=', provider)
      .selectAll()
      .executeTakeFirst()
  }

  async createIdentity(userId: string, socialId: string, provider: string, accessToken: string, refreshToken: string, identityData: any) {
    return await this.db
      .insertInto('identities')
      .values({
        user_id: userId,
        provider_id: socialId,
        provider: provider,
        access_token: accessToken,
        refresh_token: refreshToken,
        identity_data: identityData,
        last_sign_in_at: new Date()
      })
      .returningAll()
      .executeTakeFirst()
  }

  async findUserByEmail(email: string) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where(eb => eb.fn('lower', ['email']), '=', email.toLowerCase())
      .executeTakeFirst()
  }

  async createUser(email: string, alias: string) {
    return await this.db
      .insertInto('users')
      .values({
        email: email,
        alias: alias,
        last_sign_in_at: new Date()
      })
      .returningAll()
      .executeTakeFirst()
  }

  async createMagicLink(email: string, alias: string, token: string, minutesToLive: number) {
    const expiresAt = new Date(Date.now() + minutesToLive * 60 * 1000)
    const magicLink = await this.db
      .insertInto('magic_auth')
      .values({
        email, alias, token, expires_at: expiresAt
      })
      .execute()

    return !!magicLink
  }
}