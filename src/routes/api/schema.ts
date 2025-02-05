import { Type, Static } from '@sinclair/typebox'

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