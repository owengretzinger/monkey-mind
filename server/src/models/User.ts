import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userEmail: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);