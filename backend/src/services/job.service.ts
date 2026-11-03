import mongoose from 'mongoose';
import { JobPosting, IJobPosting } from '../models/jobPosting.model';
import { Recommendation, IRecommendation } from '../models/recommendation.model';
import { RecommendationBatch } from '../models/recommendationBatch.model';
import { SavedJob, ISavedJob } from '../models/savedJob.model';
import { ApiError } from '../utils/ApiError';

export class JobService {
  /**
   * Retrieves recommended jobs for candidate
   */
  public static async getRecommendedJobs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ recommendations: IRecommendation[]; total: number }> {
    // Find latest completed batch
    const latestBatch = await RecommendationBatch.findOne({
      user: userId,
      status: 'completed',
    }).sort({ generatedAt: -1 });

    const query: any = { user: userId };
    if (latestBatch) {
      query.batch = latestBatch._id;
    }

    const skip = (page - 1) * limit;
    const [recommendations, total] = await Promise.all([
      Recommendation.find(query)
        .populate('job')
        .sort({ matchScore: -1 })
        .skip(skip)
        .limit(limit),
      Recommendation.countDocuments(query),
    ]);

    return { recommendations, total };
  }

  /**
   * Retrieves top 10 recommended jobs for a specific platform
   */
  public static async getRecommendedByPlatform(
    userId: string,
    platform: string,
  ): Promise<IRecommendation[]> {
    const latestBatch = await RecommendationBatch.findOne({
      user: userId,
      status: 'completed',
    }).sort({ generatedAt: -1 });

    const query: any = { user: userId, platform };
    if (latestBatch) {
      query.batch = latestBatch._id;
    }

    return Recommendation.find(query)
      .populate('job')
      .sort({ rankInPlatform: 1, matchScore: -1 })
      .limit(10);
  }

  /**
   * Retrieves single job details with recommendation match data if available
   */
  public static async getJobById(
    jobId: string,
    userId?: string,
  ): Promise<{ job: IJobPosting; recommendation?: IRecommendation | null; isSaved: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw ApiError.badRequest('Invalid job ID format');
    }

    const job = await JobPosting.findById(jobId);
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    let recommendation = null;
    let isSaved = false;

    if (userId) {
      [recommendation, isSaved] = await Promise.all([
        Recommendation.findOne({ user: userId, job: jobId }).sort({ createdAt: -1 }),
        SavedJob.exists({ user: userId, job: jobId }).then((res) => !!res),
      ]);
    }

    return { job, recommendation, isSaved };
  }

  /**
   * Toggles saving a job for candidate
   */
  public static async toggleSaveJob(
    userId: string,
    jobId: string,
    notes?: string,
  ): Promise<{ saved: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw ApiError.badRequest('Invalid job ID format');
    }

    const existing = await SavedJob.findOne({ user: userId, job: jobId });
    if (existing) {
      await SavedJob.deleteOne({ _id: existing._id });
      return { saved: false };
    }

    await SavedJob.create({
      user: userId,
      job: jobId,
      notes,
      savedAt: new Date(),
    });

    return { saved: true };
  }

  /**
   * Retrieves all saved jobs for candidate
   */
  public static async getSavedJobs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ savedJobs: ISavedJob[]; total: number }> {
    const skip = (page - 1) * limit;
    const [savedJobs, total] = await Promise.all([
      SavedJob.find({ user: userId })
        .populate('job')
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit),
      SavedJob.countDocuments({ user: userId }),
    ]);

    return { savedJobs, total };
  }
}

