import type { Kysely } from 'kysely'
import courses from '../etf/Courses'
import lessonPlans from '../etf/LessonPlans'
import lessonContentParts from '../etf/LessonContentParts'
import lessonPaths from '../etf/LessonPaths'
import lessonSteps from '../etf/LessonSteps'

export async function seed(db: Kysely<any>): Promise<void> {
	await courses.copyData()
	await lessonPlans.copyData()
	await lessonContentParts.copyData()
	await lessonPaths.copyData()
	await lessonSteps.copyData()
}
