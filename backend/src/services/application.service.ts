import mongoose from 'mongoose';
import { Application, IApplication, ApplicationStatus } from '../models/application.model';
import { ApiError } from '../utils/ApiError';
import { CreateApplicationInput, UpdateApplicationInput } from '../validators/application.validator';

export class ApplicationService {
  /**
   * Retrieves all job applications for user
   */
  public static async getApplications(userId: string): Promise<IApplication[]> {
    const userCondition = mongoose.Types.ObjectId.isValid(userId)
      ? { $in: [userId, new mongoose.Types.ObjectId(userId)] }
      : userId;
    return Application.find({ user: userCondition })
      .populate('job')
      .sort({ updatedAt: -1 });
  }

  /**
   * Creates or tracks a job application
   */
  public static async createApplication(
    userId: string,
    input: CreateApplicationInput,
  ): Promise<IApplication> {
    const existing = await Application.findOne({ user: userId, job: input.jobId });
    if (existing) {
      throw ApiError.conflict('An application record for this job already exists');
    }

    const application = await Application.create({
      user: userId,
      job: input.jobId,
      status: input.status,
      appliedAt: input.status === 'applied' ? new Date() : undefined,
      notes: input.notes,
      statusHistory: [
        {
          status: input.status,
          changedAt: new Date(),
          notes: input.notes,
        },
      ],
    });

    return application.populate('job');
  }

  /**
   * Updates application status and appends to status history
   */
  public static async updateApplication(
    userId: string,
    applicationId: string,
    input: UpdateApplicationInput,
  ): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw ApiError.badRequest('Invalid application ID');
    }

    const application = await Application.findOne({ _id: applicationId, user: userId });
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    if (input.status && input.status !== application.status) {
      application.status = input.status;
      if (input.status === 'applied' && !application.appliedAt) {
        application.appliedAt = new Date();
      }
      application.statusHistory.push({
        status: input.status,
        changedAt: new Date(),
        notes: input.notes,
      });
    }

    if (input.notes !== undefined) {
      application.notes = input.notes;
    }

    await application.save();
    return application.populate('job');
  }
}

