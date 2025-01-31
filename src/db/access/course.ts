import { genKey } from "../../utils"
import { db } from "../Database"

const selectCourseQuery = db
  .selectFrom('courses')
  .selectAll()

// queries
export const getCourse = async (key: string) => {
  return await selectCourseQuery
    .where('public_key', '=', key)
    .executeTakeFirst()
}

export const getCourses = async () => {
  return await selectCourseQuery.execute()
}

// mutations
export const createCourse = async (title: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) => {

  return await db
    .insertInto('courses')
    .values({
      public_key: genKey(),
      title,
      description,
      syllabus,
      teaser,
      cover_art: coverArt
    })
    .executeTakeFirst()
}

export const updateCourse = async (key: string, title?: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) => {

  return await db
    .updateTable('courses')
    .set({
      title,
      description,
      syllabus,
      teaser,
      cover_art: coverArt
    })
    .where('public_key', '=', key)
    .executeTakeFirst()
}
