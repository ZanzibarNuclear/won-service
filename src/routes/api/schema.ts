import { Type, Static } from '@sinclair/typebox'

export const CourseBodySchema = Type.Object({
  title: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  syllabus: Type.Optional(Type.String()),
  teaser: Type.Optional(Type.String()),
  coverArt: Type.Optional(Type.String()),
})
export type CourseBodyType = Static<typeof CourseBodySchema>

export const CourseSchema = Type.Object({
  publicKey: Type.String(),
  title: Type.String(),
  description: Type.String(),
  syllabus: Type.String(),
  teaser: Type.String(),
  coverArt: Type.String(),
  createdAt: Type.String(),
  publishedAt: Type.String(),
  archivedAt: Type.String(),
})
export type CourseType = Static<typeof CourseSchema>

export const LessonPlanSchema = Type.Object({})

export const LessonPathSchema = Type.Object({})


export const LessonContentSchema = Type.Object({
  id: Type.Number(),
  publicKey: Type.String(),
  lessonKey: Type.String(),
  contentPartType: Type.String(),
  content: Type.String(),
  sequence: Type.Number(),
})
export type LessonContentType = Static<typeof LessonContentSchema>

export const LessonContentBodySchema = Type.Object({
  lessonKey: Type.String(),
  contentPartType: Type.String(),
  content: Type.String(),
  sequence: Type.Number(),
})
export type LessonContentBodyType = Static<typeof LessonContentSchema>

export const lessonStepPayloadSchema = {
  lessonPath: { type: 'string' },
  from: { type: 'string' },
  to: { type: 'string' },
  teaser: { type: 'string' },
}

export const lessonStepSchema = {
  id: { type: 'number' },
  lessonPath: { type: 'string' },
  from: { type: 'string' },
  to: { type: 'string' },
  teaser: { type: 'string' },
}