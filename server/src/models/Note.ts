import mongoose, { Schema, Document } from 'mongoose';


export enum HatType {
  None = 'none',
  Banana = 'banana',
  Girlfriend = 'girlfriend',
  Grad = 'grad',
  Wizard = 'wizard',
  Tinfoil = 'tinfoil',
  Military = 'military'
}
// Interface for the document
export interface INote extends Document {
  color: number;
  tilt: number
  author: mongoose.Types.ObjectId;
  date: Date;
  title: string;
  content: string;
  positionX: number;
  positionY: number;
  hat: HatType;
  profilePic: string;
}

// Schema definition
const NoteSchema = new Schema({
  color: { type: Number, required: true },
  tilt: { type: Number, required: true},
  author: { type: String, required: true },
  authorID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  positionX: { type: Number, required: true },
  positionY: { type: Number, required: true },
  hat: { 
    type: String, 
    enum: Object.values(HatType),
    default: HatType.None 
  },
  profilePic: { type: String, required: true }
});

// Export the model
export default mongoose.model<INote>('Note', NoteSchema);