import type { Kysely } from 'kysely'
import courses from '../etl/Courses'
import lessonPlans from '../etl/LessonPlans'
import lessonContentParts from '../etl/LessonContentParts'
import lessonPaths from '../etl/LessonPaths'
import lessonSteps from '../etl/LessonSteps'

export async function seed(db: Kysely<any>): Promise<void> {
	await courses.copyData()
	await lessonPlans.copyData()
	await lessonContentParts.copyData()
	await lessonPaths.copyData()
	await lessonSteps.copyData()
}
