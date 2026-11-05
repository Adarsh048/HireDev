import mongoose from 'mongoose';
import { JobPosting, IJobPosting } from '../models/jobPosting.model';
import { Recommendation, IRecommendation } from '../models/recommendation.model';
import { RecommendationBatch } from '../models/recommendationBatch.model';
import { SavedJob, ISavedJob } from '../models/savedJob.model';
import { ApiError } from '../utils/ApiError';

const DEV_REGEX = /engineer|developer|frontend|backend|full[\s\-]*stack|software|programmer|sde|coding|web[\s\-]*dev|mobile[\s\-]*dev|intern/i;
const NON_DEV_REGEX = /devops|cloud[\s\-]*trainee|qa|test[\s\-]*engineer|cybersecurity|analyst|marketing|sales|gtm|quality|product[\s\-]*manag|consultant|manager|executive|support|operations|campaign|growth|traffic|recruitment|recruiter|talent|hr\b|trainer|instructional|associate|cst|data\s*scientist/i;

export class JobService {
  /**
   * Safe salary string formatter
   */
  public static formatSalary(salary: any): string {
    if (!salary) return 'Competitive';
    if (typeof salary === 'string') return salary.trim() || 'Competitive';
    if (typeof salary === 'object') {
      const min = salary.min ? Number(salary.min) : null;
      const max = salary.max ? Number(salary.max) : null;
      const period = salary.period || 'yearly';
      const isMonthly = period === 'monthly' || (min !== null && min < 100000);

      const formatVal = (val: number) => {
        if (val >= 100000) {
          const lpa = val / 100000;
          return `₹${Number.isInteger(lpa) ? lpa : lpa.toFixed(1)} LPA`;
        }
        return `₹${val.toLocaleString('en-IN')}${isMonthly ? '/mo' : ''}`;
      };

      if (min && max) {
        if (min >= 100000) {
          const minL = min / 100000;
          const maxL = max / 100000;
          const minStr = Number.isInteger(minL) ? minL : minL.toFixed(1);
          const maxStr = Number.isInteger(maxL) ? maxL : maxL.toFixed(1);
          return `₹${minStr} - ₹${maxStr} LPA`;
        }
        return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}${isMonthly ? ' / month' : ''}`;
      }
      if (min) return `${formatVal(min)}+`;
      if (max) return `Up to ${formatVal(max)}`;
    }
    return 'Competitive';
  }

  /**
   * Retrieves public latest developer opportunities for Landing page
   */
  public static async getLatestJobs(category: string = 'all', limit: number = 6): Promise<any[]> {
    let filter: any = { isActive: true };
    if (category === 'fulltime') {
      filter = { ...filter, employmentType: { $not: /intern/i }, title: { $not: /intern/i } };
    } else if (category === 'internship') {
      filter = { ...filter, $or: [{ employmentType: /intern/i }, { title: /intern/i }] };
    } else if (category === 'remote') {
      filter = { ...filter, $or: [{ workMode: 'remote' }, { 'location.remote': true }] };
    }

    const allActive = await JobPosting.find(filter).sort({ postingDate: -1 }).limit(60);
    const devJobs = allActive.filter((j) => DEV_REGEX.test(j.title) && !NON_DEV_REGEX.test(j.title));
    const results = (devJobs.length > 0 ? devJobs : allActive).slice(0, limit);

    return results.map((j) => {
      const doc = j.toObject ? j.toObject() : { ...j };
      doc.id = doc._id.toString();
      doc.salary = JobService.formatSalary(doc.salary);
      return doc;
    });
  }

  /**
   * Retrieves recommended jobs for candidate
   */
  public static async getRecommendedJobs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ recommendations: any[]; total: number }> {
    const userCondition = mongoose.Types.ObjectId.isValid(userId)
      ? { $in: [userId, new mongoose.Types.ObjectId(userId)] }
      : userId;

    // Find latest completed batch
    const latestBatch = await RecommendationBatch.findOne({
      user: userCondition,
      status: 'completed',
    }).sort({ generatedAt: -1 });

    if (!latestBatch) {
      // Candidate has not uploaded a resume yet; recommendations are only unlocked after resume analysis
      return { recommendations: [], total: 0 };
    }

    const query: any = { user: userCondition, batch: latestBatch._id };

    const skip = (page - 1) * limit;
    const [rawRecommendations, total] = await Promise.all([
      Recommendation.find(query)
        .populate('job')
        .sort({ matchScore: -1 })
        .skip(skip)
        .limit(limit),
      Recommendation.countDocuments(query),
    ]);

    const sanitizedRecs = rawRecommendations
      .filter((r) => r.job && DEV_REGEX.test((r.job as any).title) && !NON_DEV_REGEX.test((r.job as any).title))
      .map((r) => {
        const obj = r.toObject ? r.toObject() : { ...r };
        obj.id = obj._id.toString();
        if (obj.job) {
          (obj.job as any).id = (obj.job as any)._id.toString();
          (obj.job as any).salary = JobService.formatSalary((obj.job as any).salary);
        }
        return obj;
      });

    return { recommendations: sanitizedRecs, total: total || sanitizedRecs.length };
  }

  /**
   * Retrieves top 10 recommended jobs for a specific platform
   */
  public static async getRecommendedByPlatform(
    userId: string,
    platform: string,
  ): Promise<any[]> {
    const userCondition = mongoose.Types.ObjectId.isValid(userId)
      ? { $in: [userId, new mongoose.Types.ObjectId(userId)] }
      : userId;

    const latestBatch = await RecommendationBatch.findOne({
      user: userCondition,
      status: 'completed',
    }).sort({ generatedAt: -1 });

    if (!latestBatch) {
      return [];
    }

    const query: any = { user: userCondition, platform: new RegExp(`^${platform}$`, 'i'), batch: latestBatch._id };

    const rawRecommendations = await Recommendation.find(query)
      .populate('job')
      .sort({ rankInPlatform: 1, matchScore: -1 })
      .limit(10);

    return rawRecommendations
      .filter((r) => r.job && DEV_REGEX.test((r.job as any).title) && !NON_DEV_REGEX.test((r.job as any).title))
      .map((r) => {
        const obj = r.toObject ? r.toObject() : { ...r };
        obj.id = obj._id.toString();
        if (obj.job) {
          (obj.job as any).id = (obj.job as any)._id.toString();
          (obj.job as any).salary = JobService.formatSalary((obj.job as any).salary);
        }
        return obj;
      });
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
      const userCondition = mongoose.Types.ObjectId.isValid(userId)
        ? { $in: [userId, new mongoose.Types.ObjectId(userId)] }
        : userId;

      [recommendation, isSaved] = await Promise.all([
        Recommendation.findOne({ user: userCondition, job: jobId }).sort({ createdAt: -1 }),
        SavedJob.exists({ user: userCondition, job: jobId }).then((res) => !!res),
      ]);
    }

    const jobObj: any = job.toObject ? job.toObject() : { ...job };
    jobObj.id = jobObj._id.toString();
    jobObj.salary = JobService.formatSalary(jobObj.salary);

    return { job: jobObj, recommendation, isSaved };
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

    const userCondition = mongoose.Types.ObjectId.isValid(userId)
      ? { $in: [userId, new mongoose.Types.ObjectId(userId)] }
      : userId;

    const existing = await SavedJob.findOne({ user: userCondition, job: jobId });
    if (existing) {
      await SavedJob.deleteOne({ _id: existing._id });
      return { saved: false };
    }

    await SavedJob.create({
      user: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
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
    const userCondition = mongoose.Types.ObjectId.isValid(userId)
      ? { $in: [userId, new mongoose.Types.ObjectId(userId)] }
      : userId;

    const skip = (page - 1) * limit;
    const [savedJobs, total] = await Promise.all([
      SavedJob.find({ user: userCondition })
        .populate('job')
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit),
      SavedJob.countDocuments({ user: userCondition }),
    ]);

    const sanitized = savedJobs
      .filter((s) => s.job && DEV_REGEX.test((s.job as any).title) && !NON_DEV_REGEX.test((s.job as any).title))
      .map((s) => {
        const obj = s.toObject ? s.toObject() : { ...s };
        obj.id = obj._id.toString();
        if (obj.job) {
          (obj.job as any).id = (obj.job as any)._id.toString();
          (obj.job as any).salary = JobService.formatSalary((obj.job as any).salary);
        }
        return obj as any;
      });

    return { savedJobs: sanitized, total: sanitized.length };
  }
}

