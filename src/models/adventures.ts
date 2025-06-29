import mongoose, { Schema, Document, Model } from 'mongoose';

// Embedded document: Storyline
export interface Storyline {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  sequence: number;
}

// Adventure summary type
export interface AdventureSummary {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Full Adventure type with embedded storylines
export interface Adventure extends AdventureSummary {
  storylines: Storyline[];
}

// Storyline schema
const StorylineSchema = new Schema<Storyline>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    sequence: { type: Number, required: true },
  },
  { _id: true }
);

// Adventure schema
const AdventureSchema = new Schema<Adventure>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    storylines: { type: [StorylineSchema], default: [] },
  },
  { timestamps: true }
);

// Adventure model
export interface AdventureDocument extends Adventure, Document { }
export const AdventureModel: Model<AdventureDocument> =
  mongoose.models.Adventure || mongoose.model<AdventureDocument>('Adventure', AdventureSchema);