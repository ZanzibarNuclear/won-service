import { supaDB as sourceDB } from '../Supabase'
import { db as targetDB } from '../Database'

const copyData = async () => {
  const sourceData = await sourceDB.selectFrom('lesson_plans').selectAll().execute()

  const transformed = sourceData.map((row) => ({
    course_key: row.course_key,
    cover_art: row.cover_art,
    description: row.description,
    objective: row.objective,
    public_key: row.public_key || '',
    published_at: row.published_at,
    sequence: row.sequence,
    title: row.title
  }))

  await targetDB.insertInto('lesson_plans')
    .values(transformed)
    .execute()
}

export default {
  copyData
}