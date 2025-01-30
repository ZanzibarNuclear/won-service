import { supaDB as sourceDB } from '../Supabase'
import { db as targetDB } from '../Database'

const copyData = async () => {
  const sourceData = await sourceDB.selectFrom('courses').selectAll().execute()

  const transformed = sourceData.map((row) => ({
    cover_art: row.cover_art,
    description: row.description,
    public_key: row.public_key,
    published_at: row.published_at,
    syllabus: row.syllabus,
    teaser: row.teaser,
    test_only: row.test_only,
    title: row.title
  }))

  await targetDB.insertInto('courses')
    .values(transformed)
    .execute()
}

export default {
  copyData
}