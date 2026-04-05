import mongoose, { Schema, Document } from 'mongoose';

export interface IFlat extends Document {
  name: string;
  address: string;
  email: string;
  password: string;
  createdAt: Date;
}

const FlatSchema = new Schema<IFlat>({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Flat || mongoose.model<IFlat>('Flat', FlatSchema);
