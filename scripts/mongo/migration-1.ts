import 'dotenv/config'
import { MongoClient } from 'mongodb'

const collections = ['storylines', 'campaigns', 'players', 'items', 'zones', 'rooms', 'npcs', 'events']
const dbName = 'adventure'

async function ensureCollections() {
  if (!process.env.MONGO_URI) {
    console.error('URI to Mongo cluster not found')
    process.exit(-1)
  }
  const client = new MongoClient(process.env.MONGO_URI)
  try {
    await client.connect()
    const db = client.db(dbName)
    const existingCollections = await db.listCollections().toArray()
    const existingNames = existingCollections.map(c => c.name)

    for (const name of collections) {
      if (!existingNames.includes(name)) {
        await db.createCollection(name)
        console.log(`Created collection: ${name}`)
      } else {
        console.log(`Collection already exists: ${name}`)
      }
    }
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

ensureCollections()
