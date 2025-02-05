import { Kysely } from "kysely"
import { DB, Courses } from '../types'
import { genKey } from "../../utils"
import { Course } from "../../types/won-flux-types"

export class CourseRepository {
  constructor(private db: Kysely<DB>) { }

  private mapToCourse(record: Courses): Course {
    return {
      id: record.id,
      publicKey: record.public_key,
      title: record.title,
      description: record.description,
      syllabus: record.syllabus,
      teaser: record.teaser,
      coverArt: record.cover_art,
      createdAt: record.created_at,
      archivedAt: record.archived_at,
      publishedAt: record.published_at,
      testOnly: record.test_only
    }
  }
  async getCourses() {
    const results = await this.db.selectFrom('courses').selectAll().execute()
    return results.map(row => this.mapToCourse(row))
  }

  async getCourse(key: string) {
    const result = await this.db
      .selectFrom('courses')
      .selectAll()
      .where('public_key', '=', key)
      .executeTakeFirst()

    if (!result) return undefined

    return this.mapToCourse(result)
  }

  async createCourse(title: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) {

    const result = await this.db
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

    if (!result) return undefined

    return this.mapToCourse(result)
  }

  async updateCourse(key: string, title?: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) {

    const result = await this.db
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

    if (!result) return undefined

    return this.mapToCourse(result)
  }

  async deleteCourse(key: string) {
    return await this.db
      .deleteFrom('courses')
      .where('public_key', '=', key)
      .execute()
  }

  async publish(key: string) {
    const result = await this.db
      .updateTable('courses')
      .set({ published_at: new Date() })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()

    if (!result) return undefined

    return this.mapToCourse(result)
  }

  async unpublish(key: string) {
    const result = await this.db
      .updateTable('courses')
      .set({ published_at: null })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()

    if (!result) return undefined

    return this.mapToCourse(result)
  }

  async archive(key: string) {
    const result = await this.db
      .updateTable('courses')
      .set({ archived_at: new Date() })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()

    if (!result) return undefined

    return this.mapToCourse(result)
  }

  async unarchive(key: string) {
    const result = await this.db
      .updateTable('courses')
      .set({ archived_at: null })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()

    if (!result) return undefined

    return this.mapToCourse(result)
  }
}
