import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  slug: z.string().min(2).max(150).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  image: z.string().url('Image must be a valid URL').nullable().optional(),
  githubUrl: z.string().url('GitHub URL must be valid').nullable().optional(),
  liveUrl: z.string().url('Live URL must be valid').nullable().optional(),
  featured: z.boolean().default(false),
  technologies: z.array(z.string().min(1)).min(1, 'At least one technology is required'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  technology: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'featured']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
