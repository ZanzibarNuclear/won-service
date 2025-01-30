import type { Kysely } from 'kysely'
import courses from '../etf/Courses'
import lessonPlans from '../etf/LessonPlans'

export async function seed(db: Kysely<any>): Promise<void> {
  await courses.copyData()
  await lessonPlans.copyData()
}
