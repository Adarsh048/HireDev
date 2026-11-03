export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'candidate' | 'admin';
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
  education: Education[];
  skills: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  projects: Project[];
  experience: Experience[];
  internships: Internship[];
  certifications: string[];
  preferences: Preferences;
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: number;
  cgpa?: number;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrentRole: boolean;
}

export interface Internship {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Preferences {
  jobCategories: string[];
  preferredLocations: string[];
  workMode: string[];
  employmentTypes: string[];
  minSalary?: number;
  maxExperienceYears?: number;
}

export interface JobPosting {
  id: string;
  source: string;
  title: string;
  company: string;
  location: {
    city?: string;
    state?: string;
    country: string;
    remote: boolean;
  };
  workMode: 'on-site' | 'remote' | 'hybrid';
  employmentType: string;
  minExperienceMonths?: number;
  maxExperienceMonths?: number;
  eligibleBatches?: number[];
  requiredSkills: string[];
  description: string;
  salary?: string;
  postingDate: string;
  deadline?: string;
  originalUrl: string;
  applicationUrl: string;
  firstDiscovered: string;
  lastVerified: string;
  isActive: boolean;
}

export interface Recommendation {
  id: string;
  job: JobPosting;
  platform: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  eligibility: {
    passes: boolean;
    reasons: string[];
  };
  rankInPlatform: number;
}

export interface SavedJob {
  id: string;
  job: JobPosting;
  savedAt: string;
  notes?: string;
}

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'rejected' | 'offered';

export interface Application {
  id: string;
  job: JobPosting;
  status: ApplicationStatus;
  appliedAt?: string;
  notes?: string;
  statusHistory: { status: string; changedAt: string; notes?: string }[];
}

export interface RefreshStatus {
  lastRefreshAt?: string;
  nextRefreshAt?: string;
  status: 'idle' | 'in-progress' | 'completed' | 'failed';
  consecutiveFailures: number;
}

export interface DashboardStats {
  totalMatchingJobs: number;
  newJobsDiscovered: number;
  highestMatchScore: number;
  jobsByPlatform: Record<string, number>;
  lastRefreshAt?: string;
  nextRefreshAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: { path: string; msg: string }[];
  };
}
