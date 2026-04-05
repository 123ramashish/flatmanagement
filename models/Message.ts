import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  flatId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text?: string;
  imageUrl?: string;
  workId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  imageUrl: { type: String },
  workId: { type: Schema.Types.ObjectId, ref: 'Work' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
