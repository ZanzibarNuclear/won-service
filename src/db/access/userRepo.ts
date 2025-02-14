import { Kysely } from "kysely"
import { DB } from '../types'

export class UserRepository {
  constructor(private db: Kysely<DB>) { }

  async getUser(id: string) {
    return await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }

  async getUsers() {
    return []
  }
}
