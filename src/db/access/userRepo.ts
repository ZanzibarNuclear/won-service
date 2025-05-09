import { Kysely } from "kysely"
import { DB } from '../types'
import { UserCredentials } from '../../types/won-flux-types'

export class UserRepository {
  constructor(private db: Kysely<DB>) { }

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

  async createUser(email: string) {
    const user = await this.db
      .insertInto('users')
      .values({
        email: email,
        last_sign_in_at: new Date()
      })
      .returningAll()
      .executeTakeFirst()

    // create an empty profile for new user
    if (user) {
      await this.db
        .insertInto('user_profiles')
        .values({
          id: user.id
        })
        .executeTakeFirst()
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

  async getUsers(limit: number, offset: number) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .limit(10)
      .execute()
  }

  async grantRole(userId: string, role: string) {
    // TODO: handle error cases: 1) user not found, 2) role not found, 3) already granted
    return await this.db
      .insertInto('user_roles')
      .values({
        user_id: userId,
        role_id: role,
      })
      .execute()
  }

  async revokeRole(userId: string, role: string) {
    // TODO: handle error cases: 1) user not found, 2) role not found
    return await this.db
      .deleteFrom('user_roles')
      .where('user_id', '=', userId)
      .where('role_id', '=', role)
      .execute()
  }

  async getUserRoles(userId: string) {
    return await this.db
      .selectFrom('user_roles')
      .selectAll()
      .where('user_id', '=', userId)
      .execute()
  }

  async getCreds(userId: string): Promise<UserCredentials> {
    const profile = await this.db.selectFrom('user_profiles').select(['alias']).where('id', '=', userId).executeTakeFirst()
    const result = await this.getUserRoles(userId)
    const alias = profile?.alias || null
    const roles = result.map((row: any) => row.roleId)
    const creds = {
      sub: userId,
      name: alias,
      role: roles
    }
    return creds
  }
}
