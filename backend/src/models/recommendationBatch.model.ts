import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecommendationBatch extends Document {
  user: mongoose.Types.ObjectId;
  generatedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  jobCount: number;
  platformBreakdown: Map<string, number>;
  previousBatch?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationBatchSchema = new Schema<IRecommendationBatch>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending',
    },
    jobCount: {
      type: Number,
      default: 0,
    },
    platformBreakdown: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
    previousBatch: {
      type: Schema.Types.ObjectId,
      ref: 'RecommendationBatch',
    },
  },
  {
    timestamps: true,
  },
);

recommendationBatchSchema.index({ user: 1, status: 1 });
recommendationBatchSchema.index({ user: 1, generatedAt: -1 });

export const RecommendationBatch: Model<IRecommendationBatch> = mongoose.model<IRecommendationBatch>(
  'RecommendationBatch',
  recommendationBatchSchema,
);

