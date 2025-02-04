import { Kysely } from "kysely"
import { DB } from '../types'
import { genKey } from "../../utils"
import { Static, Type } from '@sinclair/typebox'

const Course = Type.Object({
  publicKey: Type.String(),
  title: Type.String(),
  coverArt: Type.String(),
  description: Type.String(),
  syllabus: Type.String(),
  teaser: Type.String(),
  createdAt: Type.Date(),
  publishedAt: Type.Date(),
  archivedAt: Type.Date(),
  testOnly: Type.Boolean(),
})
type CourseType = Static<typeof Course>

export class CourseRepository {
  constructor(private db: Kysely<DB>) { }

  // // Helper method to map database record to domain model
  // private mapToCourse(record: Courses): CourseType {
  //   return {
  //     publicKey: record.public_key,
  //     title: record.title,
  //     coverArt: record.cover_art
  //   }
  // }

  async getCourses() {
    return await this.db.selectFrom('courses').selectAll().execute()
  }

  async getCourse(key: string) {
    const result = await this.db
      .selectFrom('courses')
      .selectAll()
      .where('public_key', '=', key)
      .executeTakeFirst()

    if (!result) return undefined

    return result
  }

  async createCourse(title: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) {

    return await this.db
      .insertInto('courses')
      .values({
        public_key: genKey(),
        title,
        description,
        syllabus,
        teaser,
        cover_art: coverArt
      })
      .returningAll()
      .executeTakeFirst()
  }

  async updateCourse(key: string, title?: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) {

    return await this.db
      .updateTable('courses')
      .set({
        title,
        description,
        syllabus,
        teaser,
        cover_art: coverArt
      })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async deleteCourse(key: string) {
    return await this.db
      .deleteFrom('courses')
      .where('public_key', '=', key)
      .execute()
  }

  async publish(key: string) {

    return await this.db
      .updateTable('courses')
      .set({ published_at: new Date() })
      .where('public_key', '=', key)
      .returningAll()
      .execute()
  }

  async unpublish(key: string) {
    return await this.db
      .updateTable('courses')
      .set({ published_at: null })
      .where('public_key', '=', key)
      .returningAll()
      .execute()
  }

  async archive(key: string) {
    return await this.db
      .updateTable('courses')
      .set({ archived_at: new Date() })
      .where('public_key', '=', key)
      .execute()
  }

  async unarchive(key: string) {
    return await this.db
      .updateTable('courses')
      .set({ archived_at: null })
      .where('public_key', '=', key)
      .execute()
  }
}
