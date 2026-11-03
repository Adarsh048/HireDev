import { IJobPosting } from '../../models/jobPosting.model';

export interface RawJob {
  sourceJobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  postedAt?: Date;
  skills?: string[];
  [key: string]: any;
}

export interface JobConnector {
  readonly sourceName: string;
  fetchJobs(lastSync?: Date): Promise<RawJob[]>;
  normalizeJob(raw: RawJob): Partial<IJobPosting>;
  isAvailable(): Promise<boolean>;
}

