// src/models/storyline.model.ts
import { Collection, Db, ObjectId } from 'mongodb'
import { Storyline, Chapter, validateStoryline, validateChapter } from './storyline.schema'

export class StorylineModel {
  private collection: Collection<Storyline>

  constructor(db: Db) {
    this.collection = db.collection<Storyline>('storylines')
  }

  async create(storylineData: Partial<Storyline>): Promise<Storyline> {
    const errors = validateStoryline(storylineData)
    if (errors) throw new Error(`Validation failed: ${errors.join(', ')}`)

    const storyline: Storyline = {
      _id: new ObjectId(),
      title: storylineData.title!,
      author: storylineData.author!,
      createdAt: new Date(),
      chapters: [],
    }

    const result = await this.collection.insertOne(storyline)
    return { ...storyline, _id: result.insertedId }
  }

  async findById(id: string): Promise<Storyline | null> {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ID')
    return this.collection.findOne({ _id: new ObjectId(id) })
  }

  async list(): Promise<Pick<Storyline, '_id' | 'title' | 'author' | 'createdAt'>[]> {
    const cursor = this.collection.find(
      {},
      { projection: { _id: 1, title: 1, author: 1, createdAt: 1 } }
    )
    return cursor.toArray()
  }

  async updateStoryline(
    id: string,
    updateData: Partial<Storyline>
  ): Promise<Storyline | null> {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ID')

    const updateFields: Partial<Storyline> = {}
    if (updateData.title !== undefined) updateFields.title = updateData.title
    if (updateData.author !== undefined) updateFields.author = updateData.author

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
    return result
  }

  async addChapter(storylineId: string, chapterData: Partial<Chapter>): Promise<Chapter> {
    const errors = validateChapter(chapterData)
    if (errors) throw new Error(`Validation failed: ${errors.join(', ')}`)

    if (!ObjectId.isValid(storylineId)) throw new Error('Invalid Storyline ID')

    const chapter: Chapter = {
      _id: new ObjectId(),
      title: chapterData.title!,
      description: chapterData.description,
      order: chapterData.order! || 0,
      scenes: [],
      createdAt: new Date(),
    }

    const result = await this.collection.updateOne(
      { _id: new ObjectId(storylineId) },
      { $push: { chapters: chapter } },
    )

    if (result.modifiedCount === 0) throw new Error('Storyline not found')
    return chapter
  }

  async updateChapter(
    storylineId: string,
    chapterId: string,
    chapterData: Partial<Chapter>,
  ): Promise<Chapter> {
    const errors = validateChapter(chapterData)
    if (errors) throw new Error(`Validation failed: ${errors.join(', ')}`)

    if (!ObjectId.isValid(storylineId) || !ObjectId.isValid(chapterId)) {
      throw new Error('Invalid ID')
    }

    // Build the $set object dynamically to only update provided fields
    const setFields: Record<string, any> = {}
    if (chapterData.title !== undefined) setFields['chapters.$.title'] = chapterData.title
    if (chapterData.description !== undefined) setFields['chapters.$.description'] = chapterData.description
    if (chapterData.order !== undefined) setFields['chapters.$.order'] = chapterData.order
    if (chapterData.scenes !== undefined) setFields['chapters.$.scenes'] = chapterData.scenes

    if (Object.keys(setFields).length === 0) {
      throw new Error('No fields provided to update')
    }

    const result = await this.collection.updateOne(
      { _id: new ObjectId(storylineId), 'chapters._id': new ObjectId(chapterId) },
      { $set: setFields },
    )

    if (result.modifiedCount === 0) throw new Error('Chapter or Storyline not found')
    return { _id: new ObjectId(chapterId), ...chapterData } as Chapter
  }

  async getChapters(storylineId: string): Promise<Chapter[]> {
    if (!ObjectId.isValid(storylineId)) throw new Error('Invalid ID')
    const storyline = await this.collection.findOne(
      { _id: new ObjectId(storylineId) },
      { projection: { chapters: 1 } },
    )
    return storyline ? storyline.chapters : []
  }
}
