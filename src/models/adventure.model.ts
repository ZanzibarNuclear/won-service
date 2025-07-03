import { ObjectId } from 'mongodb'

const AdventureSchema = {
  title: { type: 'string', required: true },
  overview: { type: 'string', required: false },
  coverArt: { type: 'string', required: false },
  createdAt: { type: 'date', default: () => new Date() },
}

function validateAdventure(data: any) {
  const errors = []
  if (!data.title || typeof data.title !== 'string')
    errors.push('Title is required and must be a string')
  if (!data.author || typeof data.author !== 'string')
    errors.push('Author is required and must be a string')
  return errors.length ? errors : null
}

module.exports = { AdventureSchema, validateAdventure }
