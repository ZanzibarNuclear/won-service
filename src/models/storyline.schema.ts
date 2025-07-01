// src/models/storyline.schema.ts
import { ObjectId } from 'mongodb'

export interface Chapter {
  _id: ObjectId
  title: string
  description?: string
  order?: number
  createdAt?: Date
  updatedAt?: Date
  scenes: String[]
  openingSceneId?: string
}

export interface Storyline {
  _id?: ObjectId
  title: string
  description?: string
  coverArt?: string
  createdAt?: Date
  updatedAt?: Date
  publishedAt?: Date
  chapters: Chapter[]
}

export function validateStoryline(data: Partial<Storyline>): string[] | null {
  const errors: string[] = []
  if (!data.title || typeof data.title !== 'string')
    errors.push('Title is required and must be a string')
  return errors.length ? errors : null
}

export function validateChapter(data: Partial<Chapter>): string[] | null {
  const errors: string[] = []
  if (data.title && typeof data.title !== 'string')
    errors.push('Title must be a string')
  if (data.description && typeof data.description !== 'string')
    errors.push('Description must be a string')
  return errors.length ? errors : null
}
