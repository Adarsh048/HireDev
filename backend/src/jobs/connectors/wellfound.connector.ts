import { JobConnector, RawJob } from './base.connector';
import { IJobPosting } from '../../models/jobPosting.model';
import { logger } from '../../utils/logger';

export class WellfoundConnector implements JobConnector {
  public readonly sourceName = 'wellfound';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async fetchJobs(_lastSync?: Date): Promise<RawJob[]> {
    logger.info('[WellfoundConnector] Synchronizing startup tech roles with India filters...');
    return [];
  }

  public normalizeJob(raw: RawJob): Partial<IJobPosting> {
    return {
      source: 'wellfound',
      sourceJobId: raw.sourceJobId,
      title: raw.title,
      company: raw.company,
      location: {
        city: raw.location,
        country: 'India',
        remote: raw.location.toLowerCase().includes('remote'),
      },
      workMode: raw.location.toLowerCase().includes('remote') ? 'remote' : 'on-site',
      employmentType: 'Full-time',
      requiredSkills: raw.skills || [],
      description: raw.description,
      originalUrl: raw.url,
      applicationUrl: raw.url,
      firstDiscovered: new Date(),
      lastVerified: new Date(),
      isActive: true,
    };
  }
}

