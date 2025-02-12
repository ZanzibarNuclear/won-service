import { Type, Static } from '@sinclair/typebox'

export const CourseBodySchema = Type.Object({
  title: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  syllabus: Type.Optional(Type.String()),
  teaser: Type.Optional(Type.String()),
  coverArt: Type.Optional(Type.String()),
})
export type CourseBodyType = Static<typeof CourseBodySchema>

export const CreateCourseSchema = Type.Intersect([
  CourseBodySchema,
  Type.Object({
    title: Type.String(),
  })
])
export type CreateCourseType = Static<typeof CreateCourseSchema>

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

export const LessonPlanBodySchema = Type.Object({
  courseKey: Type.Optional(Type.String()),
  title: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  objective: Type.Optional(Type.String()),
  sequence: Type.Optional(Type.Number()),
  coverArt: Type.Optional(Type.String()),
})
export type LessonPlanBodyType = Static<typeof LessonPlanBodySchema>

export const CreateLessonPlanSchema = Type.Intersect([
  LessonPlanBodySchema,
  Type.Object({
    courseKey: Type.String(),
    title: Type.String()
  })
])
export type CreateLessonPlanType = Static<typeof CreateLessonPlanSchema>

Type.Object({
  courseKey: Type.Optional(Type.String()),
  title: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  objective: Type.Optional(Type.String()),
  sequence: Type.Optional(Type.Number()),
  coverArt: Type.Optional(Type.String()),
})

export const LessonPlanSchema = Type.Object({
  publicKey: Type.String(),
  courseKey: Type.String(),
  title: Type.String(),
  description: Type.String(),
  objective: Type.String(),
  sequence: Type.Number(),
  coverArt: Type.String(),
  createdAt: Type.String(),
  publishedAt: Type.String(),
  archivedAt: Type.String(),
})
export type LessonPlanType = Static<typeof LessonPlanSchema>

export const LessonContentSchema = Type.Object({
  publicKey: Type.String(),
  lessonKey: Type.String(),
  lessonContentType: Type.String(),
  content: Type.Any(),
  sequence: Type.Number(),
})
export type LessonContentType = Static<typeof LessonContentSchema>

export const ContentTypes = Type.Union([
  Type.Literal("html"),
  Type.Literal("video"),
  Type.Literal("image"),
  Type.Literal("figure"),
  Type.Literal("formula"),
])
export type ContentTypesType = Static<typeof ContentTypes>

export const LessonContentBodySchema = Type.Object({
  content: Type.Optional(Type.String()),
  sequence: Type.Optional(Type.Number()),
})
export type LessonContentBodyType = Static<typeof LessonContentSchema>

export const CreateLessonContentSchema = Type.Intersect([
  LessonContentBodySchema,
  Type.Object({
    lessonKey: Type.String(),
    lessonContentType: ContentTypes,
  })
])
export type CreateLessonContentType = Static<typeof CreateLessonContentSchema>

export const LessonPathSchema = Type.Object({
  publicKey: Type.Optional(Type.String()),
  courseKey: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  trailhead: Type.Optional(Type.String()),
})
export type LessonPathType = Static<typeof LessonPathSchema>

export const LessonPathBodySchema = Type.Object({
  courseKey: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  trailhead: Type.Optional(Type.String()),
})
export type LessonPathBodyType = Static<typeof LessonPathBodySchema>

export const CreateLessonPathSchema = Type.Intersect([
  LessonPathBodySchema,
  Type.Object({
    courseKey: Type.String(),
    name: Type.String(),
  })
])
export type CreateLessonPathType = Static<typeof CreateLessonPathSchema>

export const LessonStepSchema = Type.Object({
  id: Type.Optional(Type.Number()),
  lessonPath: Type.Optional(Type.String()),
  from: Type.Optional(Type.String()),
  to: Type.Optional(Type.String()),
  teaser: Type.Optional(Type.String()),
})
export type LessonStepType = Static<typeof LessonStepSchema>

export const LessonStepBodySchema = Type.Object({
  from: Type.Optional(Type.String()),
  to: Type.Optional(Type.String()),
  teaser: Type.Optional(Type.String()),
})
export type LessonStepBodyType = Static<typeof LessonStepSchema>

export const CreateLessonStepSchema = Type.Intersect([
  LessonStepBodySchema,
  Type.Object({
    lessonPath: Type.String(),
    from: Type.String(),
    to: Type.String(),
  })
])
export type CreateLessonStepType = Static<typeof CreateLessonStepSchema>
