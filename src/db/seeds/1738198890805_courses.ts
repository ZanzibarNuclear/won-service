import courses from '../etf/Courses'
import lessonPlans from '../etf/LessonPlans'
import type { Kysely } from 'kysely'

export async function seed(db: Kysely<any>): Promise<void> {
	await courses.copyData()
	await lessonPlans.copyData()
}
