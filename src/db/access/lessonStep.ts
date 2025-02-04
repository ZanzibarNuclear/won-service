import { genKey } from "../../utils"
import { db } from "../Database"

export const getStepsForPath = async (key: string) => {
  return await db.selectFrom('lesson_steps')
    .where('lesson_path', '=', key)
    .execute()
}

export const getLessonStep = async (id: number) => {
  return await db.selectFrom('lesson_steps')
    .where('id', '=', id)
    .execute()
}

export const createLessonStep = async (pathKey: string, from: string, to: string, teaser?: string) => {

  const result = await db
    .insertInto('lesson_steps')
    .values({
      lesson_path: pathKey,
      from,
      to,
      teaser,
    })
    .returning(['id', 'lesson_path', 'from', 'to', 'teaser'])
    .executeTakeFirst()

  console.log(result)
  return result
}

export const updateLessonStep = async (id: number, from?: string, to?: string, teaser?: string) => {

  return await db
    .updateTable('lesson_steps')
    .set({
      from,
      to,
      teaser,
    })
    .where('id', '=', id)
    .returning(['id', 'lesson_path', 'from', 'to', 'teaser'])
    .executeTakeFirst()
}

export const deleteLessonStep = async (id: number) => {
  await db.deleteFrom('lesson_steps').where('id', '=', id).execute()
}
