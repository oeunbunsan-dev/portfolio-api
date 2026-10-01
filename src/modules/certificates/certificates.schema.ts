import { z } from 'zod';

export const createCertificateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  issuer: z.string().min(1, 'Issuer is required').max(150),
  issueDate: z.coerce.date(),
  credentialUrl: z.string().url('Credential URL must be valid').nullable().optional(),
});

export const updateCertificateSchema = createCertificateSchema.partial();

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateSchema>;
