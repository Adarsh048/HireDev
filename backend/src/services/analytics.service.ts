import mongoose from 'mongoose';
import { CandidateProfile } from '../models/candidateProfile.model';
import { JobPosting } from '../models/jobPosting.model';
import { Application } from '../models/application.model';
import { Recommendation } from '../models/recommendation.model';

export class AnalyticsService {
  /**
   * Returns aggregated skill demand from active jobs vs candidate skills
   */
  public static async getSkillDemandAnalytics(userId: string) {
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const userCondition = mongoose.Types.ObjectId.isValid(userId)
      ? { $in: [userId, new mongoose.Types.ObjectId(userId)] }
      : userId;

    const profile = await CandidateProfile.findOne({ user: userCondition });
    const userSkills = new Set(
      (profile?.skills || []).map((s) => s.toLowerCase()),
    );

    // Aggregate top skills requested in genuine India job postings
    const skillAggregation = await JobPosting.aggregate([
      { $match: { isActive: true, 'location.country': 'India' } },
      { $unwind: '$requiredSkills' },
      { $group: { _id: { $toLower: '$requiredSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 25 },
    ]);

    const marketSkills = skillAggregation.map((item) => ({
      skill: item._id,
      demandCount: item.count,
      hasSkill: userSkills.has(item._id),
    }));

    // Find missing skills frequently cited in user's recent recommendations
    const missingSkillsAgg = await Recommendation.aggregate([
      { $match: { user: { $in: [userId, userObjId] } } },
      { $unwind: '$missingSkills' },
      { $group: { _id: { $toLower: '$missingSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recommendedToLearn = missingSkillsAgg.map((item) => ({
      skill: item._id,
      frequency: item.count,
    }));

    return {
      topMarketSkills: marketSkills,
      recommendedToLearn,
    };
  }

  /**
   * Returns application tracker funnel analytics
   */
  public static async getApplicationAnalytics(userId: string) {
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const statusCounts = await Application.aggregate([
      { $match: { user: { $in: [userId, userObjId] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const funnel: Record<string, number> = {
      saved: 0,
      applied: 0,
      interview: 0,
      rejected: 0,
      offered: 0,
    };

    statusCounts.forEach((sc) => {
      if (funnel[sc._id] !== undefined) {
        funnel[sc._id] = sc.count;
      }
    });

    const totalApplications = Object.values(funnel).reduce((a, b) => a + b, 0);

    return {
      funnel,
      totalApplications,
    };
  }
}

