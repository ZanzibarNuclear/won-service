// src/models/storyline.schema.ts
import { ObjectId } from 'mongodb'

export interface Chapter {
  _id: ObjectId
  title: string
  order: number
  scenes: String[]
  createdAt: Date
}

export interface Storyline {
  _id: ObjectId
  title: string
  author: string
  createdAt: Date
  chapters: Chapter[]
}

export function validateStoryline(data: Partial<Storyline>): string[] | null {
  const errors: string[] = []
  if (!data.title || typeof data.title !== 'string')
    errors.push('Title is required and must be a string')
  if (!data.author || typeof data.author !== 'string')
    errors.push('Author is required and must be a string')
  return errors.length ? errors : null
}

export function validateChapter(data: Partial<Chapter>): string[] | null {
  const errors: string[] = []
  if (!data.title || typeof data.title !== 'string')
    errors.push('Title is required and must be a string')
  if (typeof data.order !== 'number') errors.push('Order is required and must be a number')
  return errors.length ? errors : null
}
