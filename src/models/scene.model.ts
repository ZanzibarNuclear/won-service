import { Collection, Db, ObjectId } from 'mongodb'
import { Scene, PassageBlock, ImageBlock, VideoBlock, Transition, validateScene } from './scene.schema'

export class SceneModel {
  private collection: Collection<Scene>

  constructor(db: Db) {
    this.collection = db.collection<Scene>('scenes')
  }

  async create(sceneData: Partial<Scene>): Promise<Scene> {
    const errors = validateScene(sceneData)
    if (errors) throw new Error(`Validation failed: ${errors.join(', ')}`)

    const now = new Date()
    const scene: Scene = {
      title: sceneData.title!,
      content: sceneData.content || [],
      transitions: sceneData.transitions || [],
      createdAt: now,
      updatedAt: now,
    }

    const result = await this.collection.insertOne(scene)
    return { _id: result.insertedId, ...scene }
  }

  async findById(id: string): Promise<Scene | null> {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ID')
    return this.collection.findOne({ _id: new ObjectId(id) })
  }

  async list(): Promise<Scene[]> {
    return this.collection.find({}).toArray()
  }

  async update(id: string, updateData: Partial<Scene>): Promise<Scene | null> {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ID')
    const shapedUpdate = { ...updateData, title: updateData.title ?? 'mystery scene', content: updateData.content ?? [], transitions: updateData.transitions ?? [] }
    const errors = validateScene(shapedUpdate)
    if (errors) throw new Error(`Validation failed: ${errors.join(', ')}`)

    updateData.updatedAt = new Date()
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: shapedUpdate },
      { returnDocument: 'after' }
    )
    return result
  }

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ID')
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  }

  async addPassageBlock(sceneId: string, block: { label: string; html: string }): Promise<boolean> {
    if (!ObjectId.isValid(sceneId)) throw new Error('Invalid Scene ID')
    const now = new Date()
    const passageBlock: PassageBlock = {
      _id: new ObjectId(),
      type: 'passage',
      label: block.label,
      html: block.html,
      createdAt: now,
      updatedAt: now,
    }
    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId) },
      { $push: { content: passageBlock }, $set: { updatedAt: now } }
    )
    return result.modifiedCount === 1
  }

  async addImageBlock(sceneId: string, block: { label: string; imageSrc: string; position?: string; caption?: string }): Promise<boolean> {
    if (!ObjectId.isValid(sceneId)) throw new Error('Invalid Scene ID')
    const now = new Date()
    const imageBlock: ImageBlock = {
      _id: new ObjectId(),
      type: 'image',
      label: block.label,
      imageSrc: block.imageSrc,
      position: block.position,
      caption: block.caption,
      createdAt: now,
      updatedAt: now,
    }
    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId) },
      { $push: { content: imageBlock }, $set: { updatedAt: now } }
    )
    return result.modifiedCount === 1
  }

  async addVideoBlock(sceneId: string, block: { label: string; url: string }): Promise<boolean> {
    if (!ObjectId.isValid(sceneId)) throw new Error('Invalid Scene ID')
    const now = new Date()
    const videoBlock: VideoBlock = {
      _id: new ObjectId(),
      type: 'video',
      label: block.label,
      url: block.url,
      createdAt: now,
      updatedAt: now,
    }
    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId) },
      { $push: { content: videoBlock }, $set: { updatedAt: now } }
    )
    return result.modifiedCount === 1
  }

  async addTransition(sceneId: string, transition: { targetSceneId: string; label: string; prompt: string }): Promise<boolean> {
    if (!ObjectId.isValid(sceneId)) throw new Error('Invalid Scene ID')
    const newTransition = {
      targetSceneId: transition.targetSceneId,
      label: transition.label,
      prompt: transition.prompt,
    }
    const now = new Date()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId) },
      { $push: { transitions: newTransition }, $set: { updatedAt: now } }
    )
    return result.modifiedCount === 1
  }
}
