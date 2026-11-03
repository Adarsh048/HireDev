import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedJob extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  savedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'JobPosting',
      required: [true, 'Job reference is required'],
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

savedJobSchema.index({ user: 1, job: 1 }, { unique: true });
savedJobSchema.index({ user: 1, savedAt: -1 });

export const SavedJob: Model<ISavedJob> = mongoose.model<ISavedJob>('SavedJob', savedJobSchema);

