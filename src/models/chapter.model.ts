// src/models/chapter.model.ts
import { ObjectId } from 'mongodb'
import { StorylineModel } from './storyline.model'
import { Chapter } from './storyline.schema'
import { Db } from 'mongodb'

export class ChapterModel {
  private storylineModel: StorylineModel

  constructor(db: Db) {
    this.storylineModel = new StorylineModel(db)
  }

  async getById(storylineId: string, chapterId: string): Promise<Chapter> {
    if (!ObjectId.isValid(storylineId) || !ObjectId.isValid(chapterId)) {
      throw new Error('Invalid ID')
    }

    const storyline = await this.storylineModel.findById(storylineId)
    if (!storyline) throw new Error('Storyline not found')

    const chapter = storyline.chapters.find((ch) => ch._id.toString() === chapterId)
    if (!chapter) throw new Error('Chapter not found')
    return chapter
  }

  async update(
    storylineId: string,
    chapterId: string,
    chapterData: Partial<Chapter>,
  ): Promise<Chapter> {
    return this.storylineModel.updateChapter(storylineId, chapterId, chapterData)
  }
}
