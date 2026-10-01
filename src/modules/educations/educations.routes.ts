import { Elysia } from 'elysia';
import { educationsService } from './educations.service';
import { createEducationSchema, updateEducationSchema } from './educations.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authPlugin, requireAdmin } from '@/plugins/auth.plugin';

export const educationsRoutes = new Elysia({ prefix: '/educations' })
  .use(authPlugin)
  .get(
    '/',
    async () => {
      const list = await educationsService.findAll();
      return sendSuccess(list, 'Educations retrieved successfully');
    },
    {
      detail: {
        tags: ['Educations'],
        summary: 'List all education records',
      },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const education = await educationsService.findById(params.id);
      return sendSuccess(education, 'Education record retrieved successfully');
    },
    {
      detail: {
        tags: ['Educations'],
        summary: 'Get education record by ID',
      },
    }
  )
  .post(
    '/',
    async ({ user, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(createEducationSchema, body);
      const created = await educationsService.create(validated);
      return sendSuccess(created, 'Education record created successfully');
    },
    {
      detail: {
        tags: ['Educations'],
        summary: 'Create education record (Admin only)',
      },
    }
  )
  .put(
    '/:id',
    async ({ user, params, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(updateEducationSchema, body);
      const updated = await educationsService.update(params.id, validated);
      return sendSuccess(updated, 'Education record updated successfully');
    },
    {
      detail: {
        tags: ['Educations'],
        summary: 'Update education record (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const deleted = await educationsService.delete(params.id);
      return sendSuccess(deleted, 'Education record deleted successfully');
    },
    {
      detail: {
        tags: ['Educations'],
        summary: 'Delete education record (Admin only)',
      },
    }
  );
