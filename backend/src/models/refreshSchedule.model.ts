import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefreshSchedule extends Document {
  user: mongoose.Types.ObjectId;
  lastRefreshAt?: Date;
  nextRefreshAt: Date;
  isActive: boolean;
  consecutiveFailures: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshScheduleSchema = new Schema<IRefreshSchedule>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    lastRefreshAt: {
      type: Date,
    },
    nextRefreshAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    consecutiveFailures: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const RefreshSchedule: Model<IRefreshSchedule> = mongoose.model<IRefreshSchedule>(
  'RefreshSchedule',
  refreshScheduleSchema,
);

