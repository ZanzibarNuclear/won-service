import { Kysely } from "kysely"
import { DB, JsonValue } from '../types'
import { genKey } from "../../utils"
import type { ContentTypesType } from "../../routes/api/schema"

export class LessonContentPartRepository {
  constructor(private db: Kysely<DB>) { }

  async findByLessonPlan(key: string) {
    return await this.db
      .selectFrom('lesson_content_parts')
      .selectAll()
      .where('lesson_key', '=', key)
      .orderBy('sequence', 'asc')
      .execute()
  }

  async get(key: string) {
    return await this.db
      .selectFrom('lesson_content_parts')
      .selectAll()
      .where('public_key', '=', key)
      .executeTakeFirst()
  }

  async create(lessonKey: string, contentPartType: ContentTypesType, content?: JsonValue, sequence?: number) {
    return await this.db
      .insertInto('lesson_content_parts')
      .values({
        public_key: genKey(),
        lesson_key: lessonKey,
        lesson_content_type: contentPartType,
        content,
        sequence,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async update(key: string, content?: JsonValue, sequence?: number) {
    return await this.db
      .updateTable('lesson_content_parts')
      .set({
        content,
        sequence,
      })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async delete(key: string) {
    return await this.db
      .deleteFrom('lesson_content_parts')
      .where('public_key', '=', key)
      .execute()
  }
}