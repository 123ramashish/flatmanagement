import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkType extends Document {
  name: string;
  icon: string;
  color: string;
  flatId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WorkTypeSchema = new Schema<IWorkType>({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '🧹' },
  color: { type: String, default: '#22c55e' },
  flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.WorkType || mongoose.model<IWorkType>('WorkType', WorkTypeSchema);
