import axios from 'axios';
import { env } from '../config/env';
import { CandidateProfile } from '../models/candidateProfile.model';
import { JobPosting } from '../models/jobPosting.model';
import { Recommendation } from '../models/recommendation.model';
import { RecommendationBatch } from '../models/recommendationBatch.model';
import { logger } from '../utils/logger';

export class MatchingService {
  /**
   * Runs the hybrid AI matching cycle for a single candidate profile.
   * Compares candidate profile against active India job postings.
   */
  public static async matchCandidate(userId: string): Promise<string> {
    const profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      throw new Error('Cannot run match without CandidateProfile');
    }

    // 1. Fetch genuine active job postings
    const activeJobs = await JobPosting.find({
      isActive: true,
      'location.country': 'India',
    }).limit(100);

    if (activeJobs.length === 0) {
      logger.warn('No active India jobs found to match against.');
      return 'No active jobs available';
    }

    // 2. Prepare payload for AI service
    const candidateData = {
      skills: profile.skills,
      programming_languages: profile.languages,
      frameworks: profile.frameworks,
      databases: profile.databases,
      experience_months: profile.experience.reduce((acc, exp) => {
        const start = exp.startDate ? new Date(exp.startDate).getTime() : 0;
        const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();
        const months = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
        return acc + months;
      }, 0),
      graduation_year: profile.education[0]?.graduationYear,
      preferred_locations: profile.preferences?.preferredLocations || [],
      preferred_work_modes: profile.preferences?.workMode || [],
      preferred_employment_types: profile.preferences?.employmentTypes || [],
      resume_text: `${profile.fullName} ${profile.skills.join(' ')} ${profile.experience.map((e) => e.description).join(' ')}`,
    };

    const jobsData = activeJobs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      company: j.company,
      description: j.description,
      required_skills: j.requiredSkills,
      location_city: j.location.city,
      location_state: j.location.state,
      work_mode: j.workMode,
      employment_type: j.employmentType,
      min_experience_months: j.minExperienceMonths || 0,
      max_experience_months: j.maxExperienceMonths,
      eligible_batches: j.eligibleBatches || [],
      posting_date: j.postingDate ? j.postingDate.toISOString() : undefined,
      source: j.source,
    }));

    // 3. Call AI Service
    let matchResults: any[] = [];
    try {
      const response = await axios.post(
        `${env.AI_SERVICE_URL}/api/matching/match`,
        {
          candidate: candidateData,
          jobs: jobsData,
        },
        { timeout: 45000 },
      );

      if (response.data && response.data.success) {
        matchResults = response.data.results;
      }
    } catch (err: any) {
      logger.error('Error invoking AI matching service:', err.message);
      throw err;
    }

    // 4. Create RecommendationBatch
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const platformBreakdown = new Map<string, number>();

    // Clear previous recommendations for this user so fresh batch replaces them
    await Recommendation.deleteMany({ user: userId });

    const batch = await RecommendationBatch.create({
      user: userId,
      generatedAt: new Date(),
      expiresAt,
      status: 'completed',
      jobCount: matchResults.length,
      platformBreakdown,
    });

    // 5. Group by platform and pick top 10 per platform
    const platformRankTracker: Record<string, number> = {};

    const recommendationDocs = [];
    for (const result of matchResults) {
      const job = activeJobs.find((j) => j._id.toString() === result.job_id);
      if (!job) continue;

      const platform = job.source;
      const currentRank = (platformRankTracker[platform] || 0) + 1;
      platformRankTracker[platform] = currentRank;

      // Update platform count
      platformBreakdown.set(platform, (platformBreakdown.get(platform) || 0) + 1);

      recommendationDocs.push({
        user: userId,
        job: job._id,
        batch: batch._id,
        platform,
        matchScore: result.match_score,
        matchedSkills: result.matched_skills,
        missingSkills: result.missing_skills,
        eligibility: {
          passes: result.eligibility_passes,
          reasons: result.eligibility_reasons,
        },
        rankInPlatform: currentRank,
      });
    }

    if (recommendationDocs.length > 0) {
      await Recommendation.insertMany(recommendationDocs);
    }

    batch.platformBreakdown = platformBreakdown;
    await batch.save();

    logger.info(`Match cycle completed for user ${userId}. ${recommendationDocs.length} recommendations stored.`);
    return batch._id.toString();
  }
}

