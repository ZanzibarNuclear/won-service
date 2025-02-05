import { supaDB as sourceDB } from '../Supabase'
import { db as targetDB } from '../Database'

const tableName = 'lesson_steps'

const copyData = async () => {
  const sourceData = await sourceDB.selectFrom(tableName).selectAll().execute()

  const transformed = sourceData.map((row) => ({
    from: row.from,
    lesson_path: row.lesson_path,
    teaser: row.teaser,
    to: row.to,
  }))

  await targetDB.insertInto(tableName)
    .values(transformed)
    .execute()
}

export default {
  copyData
}