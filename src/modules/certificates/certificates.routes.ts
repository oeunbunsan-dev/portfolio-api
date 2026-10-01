import { Elysia } from 'elysia';
import { certificatesService } from './certificates.service';
import { createCertificateSchema, updateCertificateSchema } from './certificates.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authPlugin, requireAdmin } from '@/plugins/auth.plugin';

export const certificatesRoutes = new Elysia({ prefix: '/certificates' })
  .use(authPlugin)
  .get(
    '/',
    async () => {
      const list = await certificatesService.findAll();
      return sendSuccess(list, 'Certificates retrieved successfully');
    },
    {
      detail: {
        tags: ['Certificates'],
        summary: 'List all earned certificates',
      },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const cert = await certificatesService.findById(params.id);
      return sendSuccess(cert, 'Certificate retrieved successfully');
    },
    {
      detail: {
        tags: ['Certificates'],
        summary: 'Get certificate details by ID',
      },
    }
  )
  .post(
    '/',
    async ({ user, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(createCertificateSchema, body);
      const created = await certificatesService.create(validated);
      return sendSuccess(created, 'Certificate created successfully');
    },
    {
      detail: {
        tags: ['Certificates'],
        summary: 'Create a new certificate record (Admin only)',
      },
    }
  )
  .put(
    '/:id',
    async ({ user, params, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(updateCertificateSchema, body);
      const updated = await certificatesService.update(params.id, validated);
      return sendSuccess(updated, 'Certificate updated successfully');
    },
    {
      detail: {
        tags: ['Certificates'],
        summary: 'Update certificate (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const deleted = await certificatesService.delete(params.id);
      return sendSuccess(deleted, 'Certificate deleted successfully');
    },
    {
      detail: {
        tags: ['Certificates'],
        summary: 'Delete certificate (Admin only)',
      },
    }
  );
