import mongoose, { Schema, Document } from 'mongoose';
import User from './User'; // Import the User model

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
  userId: { type: Schema.Types.ObjectId, ref: User.modelName, required: true }, // Reference to User model
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<INote>('Note', NoteSchema);