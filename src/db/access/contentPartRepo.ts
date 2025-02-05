import { genKey } from "../../utils"
import { db } from "../Database"
import { JsonValue } from "../types"

// TODO: see if this is useful
export enum ContentPartType {
  Html = 'html',
  Image = 'image',
  Figure = 'figure',
  Formula = 'formula',
  Video = 'video',
}

export const getContentPartsForLessonPlan = async (key: string) => {
  return await db.selectFrom('lesson_content_parts')
    .selectAll()
    .where('lesson_key', '=', key)
    .orderBy('sequence', 'asc')
    .execute()
}

export const getContentPart = async (key: string) => {
  return await db.selectFrom('lesson_content_parts')
    .selectAll()
    .where('public_key', '=', key)
    .execute()
}

export const createContentPart = async (lessonKey: string, lessonContentType: string, content?: JsonValue, sequence?: number, coverArt?: string) => {

  const result = await db
    .insertInto('lesson_content_parts')
    .values({
      public_key: genKey(),
      lesson_key: lessonKey,
      lesson_content_type: lessonContentType,
      content,
      sequence,
    })
    .returning(['public_key'])
    .executeTakeFirst()

  let newContent
  if (result?.public_key) {
    newContent = getContentPart(result.public_key)
  }
  return newContent
}

export const updateContentPart = async (key: string, content?: JsonValue, sequence?: number) => {

  await db
    .updateTable('lesson_content_parts')
    .set({
      content,
      sequence,
    })
    .where('public_key', '=', key)
    .returning(['public_key'])
    .executeTakeFirst()

  return getContentPart(key)
}

export const deleteContentPart = async (key: string) => {
  await db.deleteFrom('lesson_content_parts').where('public_key', '=', key).execute()
}
