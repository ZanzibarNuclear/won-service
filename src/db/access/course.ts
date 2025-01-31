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
  // TODO: add filters: published status, archive status,
  return await selectCourseQuery.execute()
}


// mutations
export const createCourse = async (title: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) => {

  const result = await db
    .insertInto('courses')
    .values({
      public_key: genKey(),
      title,
      description,
      syllabus,
      teaser,
      cover_art: coverArt
    })
    .returning(['public_key'])
    .executeTakeFirst()

  let newCourse
  if (result?.public_key) {
    newCourse = getCourse(result.public_key)
  }
  return newCourse
}

export const updateCourse = async (key: string, title?: string, description?: string, syllabus?: string, teaser?: string, coverArt?: string) => {

  await db
    .updateTable('courses')
    .set({
      title,
      description,
      syllabus,
      teaser,
      cover_art: coverArt
    })
    .where('public_key', '=', key)
    .returning(['public_key'])
    .executeTakeFirst()

  return getCourse(key)
}

export const deleteCourse = async (key: string) => {
  await db.deleteFrom('courses').where('public_key', '=', key).execute()
}

export const publish = async (key: string) => {
  await db
    .updateTable('courses')
    .set({ published_at: new Date() })
    .where('public_key', '=', key)
    .execute()

  return getCourse(key)
}

export const unpublish = async (key: string) => {
  await db
    .updateTable('courses')
    .set({ published_at: null })
    .where('public_key', '=', key)
    .execute()

  return getCourse(key)
}

export const archive = async (key: string) => {
  await db
    .updateTable('courses')
    .set({ archived_at: new Date() })
    .where('public_key', '=', key)
    .execute()

  return getCourse(key)
}

export const unarchive = async (key: string) => {
  await db
    .updateTable('courses')
    .set({ archived_at: null })
    .where('public_key', '=', key)
    .execute()

  return getCourse(key)
}
