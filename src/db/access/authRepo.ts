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

  async signInWithIdentity(userId: string, provider: string) {
    const identity = await this.findIdentity(userId, provider)
    if (!identity) {
      return null
    }
    return await this.db
      .updateTable('identities')
      .set({
        last_sign_in_at: new Date()
      })
      .where('id', '=', identity.id)
      .returningAll()
      .executeTakeFirst()
  }

  async findIdentities(userId: string) {
    return await this.db
      .selectFrom('identities')
      .where('user_id', '=', userId)
      .selectAll()
      .execute()
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

  async refreshTokens(id: string, accessToken: string, refreshToken: string) {
    return await this.db
      .updateTable('identities')
      .set({
        access_token: accessToken,
        refresh_token: refreshToken,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async createMagicLink(email: string, token: string, minutesToLive: number) {
    const expiresAt = new Date(Date.now() + minutesToLive * 60 * 1000)
    const magicLink = await this.db
      .insertInto('magic_auth')
      .values({
        email, token, expires_at: expiresAt
      })
      .execute()

    return !!magicLink
  }
}