import { supaDB as sourceDB } from '../Supabase'
import { db as targetDB } from '../Database'

const tableName = 'lesson_content_parts'

const copyData = async () => {
  const sourceData = await sourceDB
    .selectFrom(tableName)
    .innerJoin('lesson_plans', 'lesson_plans.id', 'lesson_content_parts.lesson_id')
    .select([
      'lesson_content_parts.content',
      'lesson_content_parts.content_type',
      'lesson_plans.public_key as lesson_key',
      'lesson_content_parts.public_key',
      'lesson_content_parts.sequence',
    ])
    .execute()

  const transformed = sourceData.map((row) => ({
    content: row.content,
    lesson_content_type: row.content_type,
    lesson_key: row.lesson_key || '',
    public_key: row.public_key,
    sequence: row.sequence
  }))

  await targetDB.insertInto(tableName)
    .values(transformed)
    .execute()
}

export default {
  copyData
}