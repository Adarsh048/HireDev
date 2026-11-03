import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Logs success or failure and exits the process on critical errors.
 */
export const connectDB = async (uri: string): Promise<void> => {
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
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
