import { Kysely } from "kysely"
import { DB } from '../types'

export class LessonStepRepository {
  constructor(private db: Kysely<DB>) { }

  async findByPath(pathKey: string) {
    return await this.db
      .selectFrom('lesson_steps')
      .selectAll()
      .where('lesson_path', '=', pathKey)
      .execute()
  }

  async get(id: number) {
    return await this.db
      .selectFrom('lesson_steps')
      .selectAll()
      .where('id', '=', id)
      .execute()
  }

  async create(pathKey: string, from: string, to: string, teaser?: string) {

    const result = await this.db
      .insertInto('lesson_steps')
      .values({
        lesson_path: pathKey,
        from,
        to,
        teaser,
      })
      .returningAll()
      .executeTakeFirst()

    console.log(result)
    return result
  }

  async update(id: number, from?: string, to?: string, teaser?: string) {

    return await this.db
      .updateTable('lesson_steps')
      .set({
        from,
        to,
        teaser,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }

  async delete(id: number) {
    await this.db
      .deleteFrom('lesson_steps')
      .where('id', '=', id)
      .execute()
  }
}