import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Sub-document interfaces ────────────────────────────────────────────────

export interface IJobLocation {
  city?: string;
  state?: string;
  country: string;
  remote?: boolean;
}

// ─── Main document interface ────────────────────────────────────────────────

export interface IJobPosting extends Document {
  source: string;
  sourceJobId: string;
  title: string;
  company: string;
  location: IJobLocation;
  workMode: 'on-site' | 'remote' | 'hybrid';
  employmentType?: string;
  minExperienceMonths?: number;
  maxExperienceMonths?: number;
  eligibleBatches: number[];
  requiredSkills: string[];
  description?: string;
  salary?: string;
  postingDate?: Date;
  deadline?: Date;
  originalUrl: string;
  applicationUrl: string;
  firstDiscovered: Date;
  lastVerified: Date;
  isActive: boolean;
  duplicateGroupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Supported job sources (platforms).
 */
export const JOB_SOURCES = [
  'linkedin',
  'naukri',
  'indeed',
  'internshala',
  'foundit',
  'wellfound',
  'other',
] as const;

export type JobSource = (typeof JOB_SOURCES)[number];

// ─── Schema ─────────────────────────────────────────────────────────────────

const jobLocationSchema = new Schema<IJobLocation>(
  {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    remote: { type: Boolean, default: false },
  },
  { _id: false },
);

const jobPostingSchema = new Schema<IJobPosting>(
  {
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: JOB_SOURCES,
    },
    sourceJobId: {
      type: String,
      required: [true, 'Source job ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    location: jobLocationSchema,
    workMode: {
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      default: 'on-site',
    },
    employmentType: { type: String },
    minExperienceMonths: { type: Number },
    maxExperienceMonths: { type: Number },
    eligibleBatches: [{ type: Number }],
    requiredSkills: [{ type: String }],
    description: { type: String },
    salary: { type: String },
    postingDate: { type: Date },
    deadline: { type: Date },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
    },
    applicationUrl: {
      type: String,
      required: [true, 'Application URL is required'],
    },
    firstDiscovered: { type: Date, default: Date.now },
    lastVerified: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    duplicateGroupId: { type: String },
  },
  {
    timestamps: true,
  },
);

// Compound unique index
jobPostingSchema.index({ source: 1, sourceJobId: 1 }, { unique: true });

// Query indexes
jobPostingSchema.index({ isActive: 1 });
jobPostingSchema.index({ company: 1 });
jobPostingSchema.index({ source: 1 });
jobPostingSchema.index({ requiredSkills: 1 });

// Text search index
jobPostingSchema.index(
  { title: 'text', company: 'text', description: 'text' },
  { name: 'job_text_search' },
);

export const JobPosting: Model<IJobPosting> =
  mongoose.model<IJobPosting>('JobPosting', jobPostingSchema);
