import { z } from 'zod';

export const jobPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const platformParamSchema = z.object({
  platform: z.enum([
    'linkedin',
    'naukri',
    'indeed',
    'internshala',
    'foundit',
    'wellfound',
    'workday',
    'greenhouse',
    'lever',
    'ashby',
    'company-careers',
  ]),
});

export type JobPaginationQuery = z.infer<typeof jobPaginationSchema>;
export type PlatformParam = z.infer<typeof platformParamSchema>;

