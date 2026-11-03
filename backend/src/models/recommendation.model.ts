import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Eligibility sub-document.
 */
export interface IEligibility {
  passes: boolean;
  reasons: string[];
}

/**
 * Recommendation document interface.
 */
export interface IRecommendation extends Document {
  user: Types.ObjectId;
  job: Types.ObjectId;
  batch: Types.ObjectId;
  platform: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  eligibility: IEligibility;
  rankInPlatform?: number;
  createdAt: Date;
  updatedAt: Date;
}

const eligibilitySchema = new Schema<IEligibility>(
  {
    passes: { type: Boolean, required: true },
    reasons: [{ type: String }],
  },
  { _id: false },
);

const recommendationSchema = new Schema<IRecommendation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'JobPosting',
      required: true,
    },
    batch: {
      type: Schema.Types.ObjectId,
      ref: 'RecommendationBatch',
      required: true,
    },
    platform: { type: String, required: true },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    eligibility: eligibilitySchema,
    rankInPlatform: { type: Number },
  },
  {
    timestamps: true,
  },
);

// Indexes
recommendationSchema.index({ user: 1, batch: 1 });
recommendationSchema.index({ user: 1, batch: 1, job: 1 }, { unique: true });

export const Recommendation: Model<IRecommendation> =
  mongoose.model<IRecommendation>('Recommendation', recommendationSchema);
