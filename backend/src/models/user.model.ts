import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * User document interface.
 */
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  role: 'candidate' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Exclude by default from queries
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['candidate', 'admin'],
      default: 'candidate',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
