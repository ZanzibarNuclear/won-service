export const lessonContentSchema = {
  id: { type: 'number' },
  publicKey: { type: 'string' },
  lessonKey: { type: 'string' },
  contentPartType: { type: 'string' },
  content: { type: 'string' },
  sequence: { type: 'number' },
}

export const lessonContentPayloadSchema = {
  lessonKey: { type: 'string' },
  contentPartType: { type: 'string' },
  content: { type: 'string' },
  sequence: { type: 'number' },
}
