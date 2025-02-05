import { Kysely } from "kysely"
import { DB } from '../types'
import { genKey } from "../../utils"

export class LessonPlanRepository {
  constructor(private db: Kysely<DB>) { }

  async findByCourse(courseKey: string) {
    return await this.db
      .selectFrom('lesson_plans')
      .selectAll()
      .where('course_key', '=', courseKey)
      .orderBy('sequence', 'asc')
      .execute()
  }

  async getLessonPlan(key: string) {
    return await this.db.selectFrom('lesson_plans')
      .selectAll()
      .where('public_key', '=', key)
      .executeTakeFirst()
  }

  async createLessonPlan(courseKey: string, title: string, description?: string, objective?: string, sequence?: number, coverArt?: string) {
    return await this.db
      .insertInto('lesson_plans')
      .values({
        public_key: genKey(),
        course_key: courseKey,
        title,
        description,
        objective,
        sequence,
        cover_art: coverArt
      })
      .returningAll()
      .executeTakeFirst()
  }

  async updateLessonPlan(key: string, title?: string, description?: string, objective?: string, sequence?: number, coverArt?: string) {
    return await this.db
      .updateTable('lesson_plans')
      .set({
        title,
        description,
        objective,
        sequence,
        cover_art: coverArt
      })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async deleteLessonPlan(key: string) {
    return await this.db
      .deleteFrom('lesson_plans')
      .where('public_key', '=', key)
      .execute()
  }

  async publish(key: string) {
    return await this.db
      .updateTable('lesson_plans')
      .set({ published_at: new Date() })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async unpublish(key: string) {
    return await this.db
      .updateTable('lesson_plans')
      .set({ published_at: null })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async archive(key: string) {
    return await this.db
      .updateTable('lesson_plans')
      .set({ archived_at: new Date() })
      .where('public_key', '=', key)
      .returningAll()
      .execute()
  }

  async unarchive(key: string) {
    return await this.db
      .updateTable('lesson_plans')
      .set({ archived_at: null })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }
}