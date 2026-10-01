import { z } from 'zod';

export const createSocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform name is required').max(100),
  url: z.string().url('Must be a valid URL'),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();

export type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;
