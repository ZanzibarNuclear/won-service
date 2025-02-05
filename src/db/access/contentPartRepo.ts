import { Kysely } from "kysely"
import { DB, JsonValue } from '../types'
import { genKey } from "../../utils"

export class LessonContentPartRepository {
  constructor(private db: Kysely<DB>) { }

  // TODO: see if this is useful
  // enum ContentPartType {
  //   Html = 'html',
  //   Image = 'image',
  //   Figure = 'figure',
  //   Formula = 'formula',
  //   Video = 'video',
  // }

  async findByLessonPlan(key: string) {
    return await this.db
      .selectFrom('lesson_content_parts')
      .selectAll()
      .where('lesson_key', '=', key)
      .orderBy('sequence', 'asc')
      .execute()
  }

  async getContentPart(key: string) {
    return await this.db
      .selectFrom('lesson_content_parts')
      .selectAll()
      .where('public_key', '=', key)
      .executeTakeFirst()
  }

  async createContentPart(lessonKey: string, lessonContentType: string, content?: JsonValue, sequence?: number, coverArt?: string) {
    return await this.db
      .insertInto('lesson_content_parts')
      .values({
        public_key: genKey(),
        lesson_key: lessonKey,
        lesson_content_type: lessonContentType,
        content,
        sequence,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async updateContentPart(key: string, content?: JsonValue, sequence?: number) {
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

  async deleteContentPart(key: string) {
    return await this.db
      .deleteFrom('lesson_content_parts')
      .where('public_key', '=', key)
      .execute()
  }
}