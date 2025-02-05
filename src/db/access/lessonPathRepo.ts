import { Kysely } from "kysely"
import { DB } from '../types'
import { genKey } from "../../utils"

export class LessonPathRepository {
  constructor(private db: Kysely<DB>) { }

  async findByCourse(courseKey: string) {
    return await this.db
      .selectFrom('lesson_paths')
      .selectAll()
      .where('course_key', '=', courseKey)
      .execute()
  }

  async getLessonPath(key: string) {
    return await this.db
      .selectFrom('lesson_paths')
      .selectAll()
      .where('public_key', '=', key)
      .executeTakeFirst()
  }

  async createLessonPath(courseKey: string, name: string, description?: string, trailhead?: string) {
    return await this.db
      .insertInto('lesson_paths')
      .values({
        public_key: genKey(),
        course_key: courseKey,
        name,
        description,
        trailhead,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async updateLessonPath(key: string, name?: string, description?: string, trailhead?: string) {
    return await this.db
      .updateTable('lesson_paths')
      .set({
        name,
        description,
        trailhead,
      })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async deleteLessonPath(key: string) {
    await this.db
      .deleteFrom('lesson_paths')
      .where('public_key', '=', key)
      .execute()
  }

}