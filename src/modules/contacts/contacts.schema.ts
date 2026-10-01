import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const contactQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isRead: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const updateContactStatusSchema = z.object({
  isRead: z.boolean(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
