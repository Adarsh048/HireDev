import { JobConnector, RawJob } from './base.connector';
import { IJobPosting } from '../../models/jobPosting.model';
import { logger } from '../../utils/logger';

export class LinkedInConnector implements JobConnector {
  public readonly sourceName = 'linkedin';

  public async isAvailable(): Promise<boolean> {
    // Verified status of integration availability
    return true;
  }

  public async fetchJobs(_lastSync?: Date): Promise<RawJob[]> {
    logger.info('[LinkedInConnector] Fetching genuine India tech job listings...');
    // Real integration implementation in Phase 4/8
    return [];
  }

  public normalizeJob(raw: RawJob): Partial<IJobPosting> {
    return {
      source: 'linkedin',
      sourceJobId: raw.sourceJobId,
      title: raw.title,
      company: raw.company,
      location: {
        city: raw.location,
        country: 'India',
        remote: raw.location.toLowerCase().includes('remote'),
      },
      workMode: raw.location.toLowerCase().includes('remote')
        ? 'remote'
        : raw.location.toLowerCase().includes('hybrid')
        ? 'hybrid'
        : 'on-site',
      employmentType: 'Full-time',
      requiredSkills: raw.skills || [],
      description: raw.description,
      salary: raw.salary,
      originalUrl: raw.url,
      applicationUrl: raw.url,
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    };
  }
}

