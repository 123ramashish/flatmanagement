import mongoose, { Schema, Document } from 'mongoose';

export interface IWork extends Document {
  userId: mongoose.Types.ObjectId;
  workTypeId: mongoose.Types.ObjectId;
  flatId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
}

const WorkSchema = new Schema<IWork>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workTypeId: { type: Schema.Types.ObjectId, ref: 'WorkType', required: true },
  flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Work || mongoose.model<IWork>('Work', WorkSchema);
