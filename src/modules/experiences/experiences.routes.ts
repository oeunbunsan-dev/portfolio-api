import { Elysia } from 'elysia';
import { experiencesService } from './experiences.service';
import { createExperienceSchema, updateExperienceSchema } from './experiences.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authPlugin, requireAdmin } from '@/plugins/auth.plugin';

export const experiencesRoutes = new Elysia({ prefix: '/experiences' })
  .use(authPlugin)
  .get(
    '/',
    async () => {
      const list = await experiencesService.findAll();
      return sendSuccess(list, 'Experiences retrieved successfully');
    },
    {
      detail: {
        tags: ['Experiences'],
        summary: 'List all professional experiences',
      },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const experience = await experiencesService.findById(params.id);
      return sendSuccess(experience, 'Experience retrieved successfully');
    },
    {
      detail: {
        tags: ['Experiences'],
        summary: 'Get experience details by ID',
      },
    }
  )
  .post(
    '/',
    async ({ user, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(createExperienceSchema, body);
      const created = await experiencesService.create(validated);
      return sendSuccess(created, 'Experience record created successfully');
    },
    {
      detail: {
        tags: ['Experiences'],
        summary: 'Create a new experience record (Admin only)',
      },
    }
  )
  .put(
    '/:id',
    async ({ user, params, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(updateExperienceSchema, body);
      const updated = await experiencesService.update(params.id, validated);
      return sendSuccess(updated, 'Experience updated successfully');
    },
    {
      detail: {
        tags: ['Experiences'],
        summary: 'Update experience record (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const deleted = await experiencesService.delete(params.id);
      return sendSuccess(deleted, 'Experience record deleted successfully');
    },
    {
      detail: {
        tags: ['Experiences'],
        summary: 'Delete experience record (Admin only)',
      },
    }
  );
