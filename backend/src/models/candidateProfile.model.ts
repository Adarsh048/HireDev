import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─── Sub-document interfaces ────────────────────────────────────────────────

export interface IEducation {
  degree: string;
  institution: string;
  graduationYear: number;
  cgpa?: number;
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface IExperience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isCurrentRole?: boolean;
}

export interface IInternship {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

export interface IPreferences {
  jobCategories: string[];
  preferredLocations: string[];
  workMode: string[];
  employmentTypes: string[];
  minSalary?: number;
  maxExperienceYears?: number;
}

// ─── Main document interface ────────────────────────────────────────────────

export interface ICandidateProfile extends Document {
  user: Types.ObjectId;
  fullName?: string;
  email?: string;
  phone?: string;
  education: IEducation[];
  skills: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  projects: IProject[];
  experience: IExperience[];
  internships: IInternship[];
  certifications: string[];
  preferences?: IPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const educationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    cgpa: { type: Number },
  },
  { _id: false },
);

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    link: { type: String },
  },
  { _id: false },
);

const experienceSchema = new Schema<IExperience>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
    isCurrentRole: { type: Boolean, default: false },
  },
  { _id: false },
);

const internshipSchema = new Schema<IInternship>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
  },
  { _id: false },
);

const preferencesSchema = new Schema<IPreferences>(
  {
    jobCategories: [{ type: String }],
    preferredLocations: [{ type: String }],
    workMode: [{ type: String }],
    employmentTypes: [{ type: String }],
    minSalary: { type: Number },
    maxExperienceYears: { type: Number },
  },
  { _id: false },
);

// ─── Main schema ────────────────────────────────────────────────────────────

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    fullName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    education: [educationSchema],
    skills: [{ type: String }],
    languages: [{ type: String }],
    frameworks: [{ type: String }],
    databases: [{ type: String }],
    projects: [projectSchema],
    experience: [experienceSchema],
    internships: [internshipSchema],
    certifications: [{ type: String }],
    preferences: preferencesSchema,
  },
  {
    timestamps: true,
  },
);

// Indexes
candidateProfileSchema.index({ user: 1 }, { unique: true });

export const CandidateProfile: Model<ICandidateProfile> =
  mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);
