import { Collection, Db, ObjectId } from 'mongodb'
import { Scene, SceneInfo, PassageBlock, ImageBlock, VideoBlock, Transition, validateScene } from './scene.schema'

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
      chapterId: sceneData.chapterId!,
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

  async list(chapterId: string): Promise<SceneInfo[]> {
    return this.collection
      .find({ chapterId }, { projection: { _id: 1, chapterId: 1, title: 1, createdAt: 1, updatedAt: 1 } })
      .toArray() as Promise<SceneInfo[]>
  }

  async update(id: string, updateData: Partial<Scene>): Promise<Scene | null> {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ID')

    const updateFields: Partial<Scene> = {}
    if (updateData.title !== undefined) updateFields.title = updateData.title

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields provided to update')
    }

    updateFields.updatedAt = new Date()
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
    return result
  }

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) throw new Error('Invalid ID')
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  }

  async addPassageBlock(sceneId: string, block: { label: string; html: string }): Promise<PassageBlock> {
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
    return passageBlock
  }

  async addImageBlock(sceneId: string, block: { label: string; imageSrc: string; position?: string; caption?: string }): Promise<ImageBlock> {
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
    return imageBlock
  }

  async addVideoBlock(sceneId: string, block: { label: string; url: string }): Promise<VideoBlock> {
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
    return videoBlock
  }

  async addTransition(sceneId: string, transition: { targetSceneId: string; label: string; prompt: string }): Promise<Transition> {
    if (!ObjectId.isValid(sceneId)) throw new Error('Invalid Scene ID')
    const newTransition: Transition = {
      targetSceneId: transition.targetSceneId,
      label: transition.label,
      prompt: transition.prompt,
    }
    const now = new Date()
    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId) },
      { $push: { transitions: newTransition }, $set: { updatedAt: now } }
    )
    return newTransition
  }
}
