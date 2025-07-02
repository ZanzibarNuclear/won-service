import { Collection, Db, ObjectId } from 'mongodb'
import { Scene, ContentBlock } from './scene.schema'

export class ContentModel {
  private collection: Collection<Scene>

  constructor(db: Db) {
    this.collection = db.collection<Scene>('scenes')
  }

  // Get a specific content block by sceneId and blockId
  async getBlock(sceneId: string, blockId: string): Promise<ContentBlock | null> {
    if (!ObjectId.isValid(sceneId) || !ObjectId.isValid(blockId)) throw new Error('Invalid ID')
    const scene = await this.collection.findOne(
      { _id: new ObjectId(sceneId), 'content._id': new ObjectId(blockId) },
      { projection: { content: 1 } }
    )
    if (!scene || !scene.content) return null
    return scene.content.find((b: any) => b._id?.toString() === blockId) || null
  }

  // Update a specific content block by sceneId and blockId
  async updateBlock(sceneId: string, blockId: string, update: Partial<ContentBlock>): Promise<ContentBlock> {
    if (!ObjectId.isValid(sceneId) || !ObjectId.isValid(blockId)) throw new Error('Invalid ID')
    update.updatedAt = new Date()
    // Exclude _id from the update object
    const entryUpdate = Object.fromEntries(
      Object.entries(update).filter(([k]) => k !== '_id').map(([k, v]) => [`content.$.${k}`, v])
    )
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(sceneId), 'content._id': new ObjectId(blockId) },
      {
        $set: entryUpdate
      },
      { returnDocument: 'after', projection: { content: 1 } }
    )
    if (!result || !result.content) throw new Error('Block not found')
    const updatedBlock = result.content.find((b: any) => b._id?.toString() === blockId)
    if (!updatedBlock) throw new Error('Block not found')
    return updatedBlock
  }

  // Delete a specific content block by sceneId and blockId
  async deleteBlock(sceneId: string, blockId: string): Promise<boolean> {
    if (!ObjectId.isValid(sceneId) || !ObjectId.isValid(blockId)) throw new Error('Invalid ID')
    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId) },
      { $pull: { content: { _id: new ObjectId(blockId) } }, $set: { updatedAt: new Date() } }
    )
    return result.modifiedCount === 1
  }
}