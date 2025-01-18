import mongoose, { Schema, Document } from 'mongoose';

// Interface to define the User document structure
export interface IUser extends Document {
  email: string;
  name: string;
  createdAt: Date;
}

// Schema definition
const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);