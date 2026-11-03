import { z } from 'zod';

export const createApplicationSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Job ID format'),
  status: z.enum(['saved', 'applied', 'interview', 'rejected', 'offered']).default('applied'),
  notes: z.string().max(2000).optional(),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['saved', 'applied', 'interview', 'rejected', 'offered']).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

