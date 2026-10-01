import { z } from 'zod';

export const createEducationSchema = z.object({
  school: z.string().min(1, 'School name is required').max(150),
  degree: z.string().min(1, 'Degree is required').max(150),
  field: z.string().min(1, 'Field of study is required').max(150),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

export const updateEducationSchema = createEducationSchema.partial();

export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;
