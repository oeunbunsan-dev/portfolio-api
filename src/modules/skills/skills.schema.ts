import { z } from 'zod';

export const createSkillSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required').max(100),
  icon: z.string().nullable().optional(),
  proficiency: z.number().int().min(1).max(100).default(80),
});

export const updateSkillSchema = createSkillSchema.partial();

export const skillQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['proficiency', 'name', 'category', 'createdAt']).default('proficiency'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type SkillQueryInput = z.infer<typeof skillQuerySchema>;
