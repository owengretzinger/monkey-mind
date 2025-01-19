import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
    _id: String,  // or whatever type your id is
    color: number;
    author: string;
    date: Date;
    tilt: number;
    title: string;
    content: string;
    positionX: number;
    positionY: number;
    hat: string;
    profilePic: string;
    link: string;
}

const NoteSchema = new Schema({
    _id: { type: String, required: true },
    color: { type: Number, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now },
    tilt: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    positionX: { type: Number, required: true },
    positionY: { type: Number, required: true },
    hat: { type: String, required: true },
    profilePic: { type: String, required: true },
    link: { type: String, required: true }
}, { _id: false });

export default mongoose.model<INote>('Note', NoteSchema);