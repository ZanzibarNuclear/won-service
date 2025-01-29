import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await loadCourses(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await deleteCourses(db)
}

const loadCourses = async (db: Kysely<any>) => {

  await db.insertInto('courses').values([
    {},
    {},
    {},
  ])
    .execute()
}

const deleteCourses = async (db: Kysely<any>) => {
  await db.deleteFrom('courses').execute()
}