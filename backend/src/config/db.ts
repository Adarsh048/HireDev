import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { JobPosting } from '../models/jobPosting.model';

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Logs success or failure and exits the process on critical errors.
 */
export const connectDB = async (uri: string): Promise<void> => {
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed developer jobs from backend/data/jobs.json if database has 0 jobs
    const jobCount = await JobPosting.countDocuments({});
    if (jobCount === 0) {
      try {
        const jobsPath = path.resolve(__dirname, '../../data/jobs.json');
        if (fs.existsSync(jobsPath)) {
          const raw = fs.readFileSync(jobsPath, 'utf-8');
          const seedJobs = JSON.parse(raw);
          if (Array.isArray(seedJobs) && seedJobs.length > 0) {
            await JobPosting.insertMany(seedJobs);
            logger.info(`Auto-seeded ${seedJobs.length} verified developer jobs into MongoDB`);
          }
        }
      } catch (seedErr: any) {
        logger.warn(`Job auto-seed note: ${seedErr.message}`);
      }
    }
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB runtime error', { error: err });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};
