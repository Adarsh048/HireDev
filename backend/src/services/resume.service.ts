import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { env } from '../config/env';
import { Resume, IResume } from '../models/resume.model';
import { CandidateProfile, ICandidateProfile } from '../models/candidateProfile.model';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { UpdateProfileInput } from '../validators/resume.validator';
import { MatchingService } from './matching.service';

export class ResumeService {
  /**
   * Save uploaded file record and triggers AI service parsing
   */
  public static async processResumeUpload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ resume: IResume; profile: ICandidateProfile }> {
    // 1. Save Resume document
    const resume = await Resume.create({
      user: userId,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      storagePath: file.path,
      fileSize: file.size,
      uploadedAt: new Date(),
    });

    // 2. Call Python AI Service for parsing
    let parsedData: any = null;
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await axios.post(`${env.AI_SERVICE_URL}/api/resume/parse`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000,
      });

      if (response.data && response.data.success && response.data.data) {
        parsedData = response.data.data;
      }
    } catch (err: any) {
      logger.error('Failed to communicate with AI parsing service:', err.message);
      // We don't fail upload completely if AI service is temporarily down;
      // an empty profile is initialized for the user to edit manually.
    }

    // 3. Upsert CandidateProfile
    const profileData: any = {
      user: userId,
      fullName: parsedData?.full_name || '',
      email: parsedData?.email || '',
      phone: parsedData?.phone || '',
      education: parsedData?.education?.map((e: any) => ({
        degree: e.degree,
        institution: e.institution,
        graduationYear: e.graduation_year,
        cgpa: e.cgpa,
      })) || [],
      skills: parsedData?.skills || [],
      languages: parsedData?.programming_languages || [],
      frameworks: parsedData?.frameworks || [],
      databases: parsedData?.databases || [],
      projects: parsedData?.projects?.map((p: any) => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies || [],
        link: p.link,
      })) || [],
      experience: parsedData?.experience?.map((exp: any) => ({
        company: exp.company,
        role: exp.role,
        startDate: exp.start_date ? new Date(exp.start_date) : undefined,
        endDate: exp.end_date ? new Date(exp.end_date) : undefined,
        description: exp.description,
        isCurrentRole: exp.is_current || false,
      })) || [],
      internships: parsedData?.internships?.map((i: any) => ({
        company: i.company,
        role: i.role,
        startDate: i.start_date ? new Date(i.start_date) : undefined,
        endDate: i.end_date ? new Date(i.end_date) : undefined,
        description: i.description,
      })) || [],
      certifications: parsedData?.certifications || [],
    };

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      { new: true, upsert: true },
    );

    // Auto-trigger matching engine so dashboard updates immediately
    MatchingService.matchCandidate(userId).catch((matchErr) => {
      logger.warn(`Post-upload match trigger notice: ${matchErr.message}`);
    });

    return { resume, profile };
  }

  /**
   * Retrieves candidate profile for user
   */
  public static async getProfile(userId: string): Promise<ICandidateProfile> {
    const profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('Candidate profile not found. Please upload a resume first.');
    }
    return profile;
  }

  /**
   * Updates candidate profile with user corrections
   */
  public static async updateProfile(
    userId: string,
    updates: UpdateProfileInput,
  ): Promise<ICandidateProfile> {
    const profile = await CandidateProfile.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true },
    );
    return profile;
  }
}

