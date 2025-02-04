import { genKey } from "../../utils"
import { db } from "../Database"

export const getLessonPlansForCourse = async (courseKey: string) => {
  const result = await db.selectFrom('lesson_plans')
    .selectAll()
    .where('course_key', '=', courseKey)
    .orderBy('sequence', 'asc')
    .execute()

  return result
}

export const getLessonPlan = async (key: string) => {
  return await db.selectFrom('lesson_plans')
    .selectAll()
    .where('public_key', '=', key)
    .execute()
}

export const createLessonPlan = async (courseKey: string, title: string, description?: string, objective?: string, sequence?: number, coverArt?: string) => {

  const result = await db
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
    .returning(['public_key'])
    .executeTakeFirst()

  let newPlan
  if (result?.public_key) {
    newPlan = getLessonPlan(result.public_key)
  }
  return newPlan
}

export const updateLessonPlan = async (key: string, title?: string, description?: string, objective?: string, sequence?: number, coverArt?: string) => {

  await db
    .updateTable('lesson_plans')
    .set({
      title,
      description,
      objective,
      sequence,
      cover_art: coverArt
    })
    .where('public_key', '=', key)
    .returning(['public_key'])
    .executeTakeFirst()

  return getLessonPlan(key)
}

export const deleteLessonPlan = async (key: string) => {
  await db.deleteFrom('lesson_plans').where('public_key', '=', key).execute()
}

export const publish = async (key: string) => {
  await db
    .updateTable('lesson_plans')
    .set({ published_at: new Date() })
    .where('public_key', '=', key)
    .execute()

  return getLessonPlan(key)
}

export const unpublish = async (key: string) => {
  await db
    .updateTable('lesson_plans')
    .set({ published_at: null })
    .where('public_key', '=', key)
    .execute()

  return getLessonPlan(key)
}

export const archive = async (key: string) => {
  await db
    .updateTable('lesson_plans')
    .set({ archived_at: new Date() })
    .where('public_key', '=', key)
    .execute()

  return getLessonPlan(key)
}

export const unarchive = async (key: string) => {
  await db
    .updateTable('lesson_plans')
    .set({ archived_at: null })
    .where('public_key', '=', key)
    .execute()

  return getLessonPlan(key)
}
