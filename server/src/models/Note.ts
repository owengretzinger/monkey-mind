import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  url: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
  url: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<INote>('Note', NoteSchema);