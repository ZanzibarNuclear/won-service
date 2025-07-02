import { ObjectId } from 'mongodb'

// --- Content Blocks ---
export interface ContentBlockBase {
  _id?: ObjectId
  type: 'passage' | 'image' | 'video'
  label: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PassageBlock extends ContentBlockBase {
  type: 'passage'
  html: string
}

export interface ImageBlock extends ContentBlockBase {
  type: 'image'
  imageSrc: string
  position?: string
  caption?: string
}

export interface VideoBlock extends ContentBlockBase {
  type: 'video'
  url: string
}

export type ContentBlock = PassageBlock | ImageBlock | VideoBlock

// --- Transition ---
export interface Transition {
  targetSceneId: ObjectId | string
  label: string
  prompt: string
}

// --- Scene ---
export interface SceneInfo {
  _id?: ObjectId
  chapterId: ObjectId | string
  title: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Scene extends SceneInfo {
  content: ContentBlock[]
  transitions: Transition[]
}

// --- Validation ---
export function validateScene(data: Partial<Scene>): string[] | null {
  const errors: string[] = []
  if (!data.title || typeof data.title !== 'string') errors.push('Title is required and must be a string')
  if (!Array.isArray(data.content)) errors.push('Content must be an array')
  if (!Array.isArray(data.transitions)) errors.push('Transitions must be an array')
  return errors.length ? errors : null
}

export function validateContentBlock(block: Partial<ContentBlock>): string[] | null {
  const errors: string[] = []
  if (!block.type) errors.push('Content block type is required')
  if (!block.label || typeof block.label !== 'string') errors.push('Label is required and must be a string')
  switch (block.type) {
    case 'passage':
      if (!(block as PassageBlock).html) errors.push('PassageBlock requires html')
      break
    case 'image':
      if (!(block as ImageBlock).imageSrc) errors.push('ImageBlock requires imageSrc')
      break
    case 'video':
      if (!(block as VideoBlock).url) errors.push('VideoBlock requires url')
      break
    default:
      errors.push('Unknown content block type')
  }
  return errors.length ? errors : null
}