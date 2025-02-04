import { genKey } from "../../utils"
import { db } from "../Database"

export const getLessonPathsForCourse = async (courseKey: string) => {
  return await db.selectFrom('lesson_paths')
    .where('course_key', '=', courseKey)
    .execute()
}

export const getLessonPath = async (key: string) => {
  return await db.selectFrom('lesson_paths')
    .where('public_key', '=', key)
    .execute()
}

export const createLessonPath = async (courseKey: string, name: string, description?: string, trailhead?: string) => {

  const result = await db
    .insertInto('lesson_paths')
    .values({
      public_key: genKey(),
      course_key: courseKey,
      name,
      description,
      trailhead,
    })
    .returning(['public_key'])
    .executeTakeFirst()

  let newPlan
  if (result?.public_key) {
    newPlan = getLessonPath(result.public_key)
  }
  return newPlan
}

export const updateLessonPath = async (key: string, name?: string, description?: string, trailhead?: string) => {

  await db
    .updateTable('lesson_paths')
    .set({
      name,
      description,
      trailhead,
    })
    .where('public_key', '=', key)
    .returning(['public_key'])
    .executeTakeFirst()

  return getLessonPath(key)
}

export const deleteLessonPath = async (key: string) => {
  await db.deleteFrom('lesson_paths').where('public_key', '=', key).execute()
}
