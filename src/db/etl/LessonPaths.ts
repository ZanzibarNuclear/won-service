import { supaDB as sourceDB } from '../Supabase'
import { db as targetDB } from '../Database'

const tableName = 'lesson_paths'

const copyData = async () => {
  const sourceData = await sourceDB.selectFrom(tableName).selectAll().execute()

  const transformed = sourceData.map((row) => ({
    course_key: row.course_key,
    description: row.description,
    name: row.name,
    public_key: row.public_key,
    trailhead: row.trailhead,
  }))

  await targetDB.insertInto(tableName)
    .values(transformed)
    .execute()
}

export default {
  copyData
}