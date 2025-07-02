import { Collection, Db, ObjectId } from 'mongodb'
import { Scene, ContentBlock } from './scene.schema'

export class TransitionModel {
  private collection: Collection<Scene>

  constructor(db: Db) {
    this.collection = db.collection<Scene>('scenes')
  }

  async get(sceneId: string, transitionId: string) {
    const scene = await this.collection.findOne(
      { _id: new ObjectId(sceneId), 'transitions._id': new ObjectId(transitionId) },
      { projection: { 'transitions.$': 1 } }
    )
    return scene?.transitions?.[0] || null
  }

  async update(sceneId: string, transitionId: string, update: Partial<any>) {
    // Remove _id from update if present
    const { _id, ...updateWithoutId } = update

    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId), 'transitions._id': new ObjectId(transitionId) },
      {
        $set: Object.fromEntries(
          Object.entries(updateWithoutId).map(([k, v]) => [`transitions.$.${k}`, v])
        )
      }
    )
    return result.modifiedCount > 0
  }

  async delete(sceneId: string, transitionId: string) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(sceneId) },
      { $pull: { transitions: { _id: new ObjectId(transitionId) } } }
    )
    return result.modifiedCount > 0
  }
}