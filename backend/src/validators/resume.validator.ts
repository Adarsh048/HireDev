import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        graduationYear: z.number().int().optional(),
        cgpa: z.number().min(0).max(10).optional(),
      }),
    )
    .optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  databases: z.array(z.string()).optional(),
  projects: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).optional(),
        link: z.string().url().optional().or(z.literal('')),
      }),
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        startDate: z.string().or(z.date()).optional(),
        endDate: z.string().or(z.date()).optional(),
        description: z.string().optional(),
        isCurrentRole: z.boolean().optional(),
      }),
    )
    .optional(),
  internships: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        startDate: z.string().or(z.date()).optional(),
        endDate: z.string().or(z.date()).optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  certifications: z.array(z.string()).optional(),
  preferences: z
    .object({
      jobCategories: z.array(z.string()).optional(),
      preferredLocations: z.array(z.string()).optional(),
      workMode: z.array(z.enum(['on-site', 'remote', 'hybrid'])).optional(),
      employmentTypes: z.array(z.string()).optional(),
      minSalary: z.number().optional(),
      maxExperienceYears: z.number().optional(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

