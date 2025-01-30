import { supaDB as sourceDB } from '../Supabase'
import { db as targetDB } from '../Database'

const tableName = 'lesson_content_parts'

const copyData = async () => {
  const sourceData = await sourceDB.selectFrom(tableName).selectAll().execute()

  const transformed = sourceData.map((row) => ({
    content: row.content,
    lesson_content_type: row.content_type,
    lesson_id: row.lesson_id,
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