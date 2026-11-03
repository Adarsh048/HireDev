import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Resume document interface.
 */
export interface IResume extends Document {
  user: Types.ObjectId;
  originalFileName: string;
  mimeType: string;
  storagePath: string;
  fileSize: number;
  uploadedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

// Indexes
resumeSchema.index({ user: 1 });

export const Resume: Model<IResume> = mongoose.model<IResume>('Resume', resumeSchema);
