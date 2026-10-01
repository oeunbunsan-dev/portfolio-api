import { z } from 'zod';

export const createExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(150),
  position: z.string().min(1, 'Position title is required').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  current: z.boolean().default(false),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
