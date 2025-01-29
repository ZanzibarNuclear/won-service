import courses from '../etf/Courses'
// import { Kysely, sql } from 'kysely'

// export async function up(db: Kysely<any>): Promise<void> {
//   await loadCourses(db)
// }

// export async function down(db: Kysely<any>): Promise<void> {
//   await deleteCourses(db)
// }

const loadCourses = async () => {

  await courses.copyData()
  // await db.insertInto('courses').values([
  //   {},
  //   {},
  //   {},
  // ])
  //   .execute()
}

const deleteCourses = async () => {
  await courses.deleteData()
}