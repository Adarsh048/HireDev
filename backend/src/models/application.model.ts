import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'rejected' | 'offered';

export interface IStatusHistory {
  status: ApplicationStatus;
  changedAt: Date;
  notes?: string;
}

export interface IApplication extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  appliedAt?: Date;
  notes?: string;
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'rejected', 'offered'],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const applicationSchema = new Schema<IApplication>(
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
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'rejected', 'offered'],
      default: 'saved',
    },
    appliedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: 'saved', changedAt: new Date() }],
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });

export const Application: Model<IApplication> = mongoose.model<IApplication>('Application', applicationSchema);

