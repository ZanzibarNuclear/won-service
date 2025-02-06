import { Kysely } from "kysely"
import { DB } from '../types'
import { genKey } from "../../utils"

export class CourseRepository {
  constructor(private db: Kysely<DB>) { }

  async findAll() {
    return await this.db.selectFrom('courses').selectAll().execute()
  }

  async get(key: string) {
    return await this.db
      .selectFrom('courses')
      .selectAll()
      .where('public_key', '=', key)
      .executeTakeFirst()
  }

  async create(title: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) {
    return await this.db
      .insertInto('courses')
      .values({
        public_key: genKey(),
        title,
        description,
        syllabus,
        teaser,
        cover_art: coverArt,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async update(key: string, title?: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) {
    return await this.db
      .updateTable('courses')
      .set({
        title,
        description,
        syllabus,
        teaser,
        cover_art: coverArt,
      })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async delete(key: string) {
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
      .executeTakeFirst()
  }

  async unpublish(key: string) {
    return await this.db
      .updateTable('courses')
      .set({ published_at: null })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async archive(key: string) {
    return await this.db
      .updateTable('courses')
      .set({ archived_at: new Date() })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }

  async unarchive(key: string) {
    return await this.db
      .updateTable('courses')
      .set({ archived_at: null })
      .where('public_key', '=', key)
      .returningAll()
      .executeTakeFirst()
  }
}
