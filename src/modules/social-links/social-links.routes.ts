import { Elysia } from 'elysia';
import { socialLinksService } from './social-links.service';
import { createSocialLinkSchema, updateSocialLinkSchema } from './social-links.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authPlugin, requireAdmin } from '@/plugins/auth.plugin';

export const socialLinksRoutes = new Elysia({ prefix: '/social-links' })
  .use(authPlugin)
  .get(
    '/',
    async () => {
      const list = await socialLinksService.findAll();
      return sendSuccess(list, 'Social links retrieved successfully');
    },
    {
      detail: {
        tags: ['Social Links'],
        summary: 'List all social profile links',
      },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const link = await socialLinksService.findById(params.id);
      return sendSuccess(link, 'Social link retrieved successfully');
    },
    {
      detail: {
        tags: ['Social Links'],
        summary: 'Get social link by ID',
      },
    }
  )
  .post(
    '/',
    async ({ user, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(createSocialLinkSchema, body);
      const created = await socialLinksService.create(validated);
      return sendSuccess(created, 'Social link created successfully');
    },
    {
      detail: {
        tags: ['Social Links'],
        summary: 'Create social link (Admin only)',
      },
    }
  )
  .put(
    '/:id',
    async ({ user, params, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(updateSocialLinkSchema, body);
      const updated = await socialLinksService.update(params.id, validated);
      return sendSuccess(updated, 'Social link updated successfully');
    },
    {
      detail: {
        tags: ['Social Links'],
        summary: 'Update social link (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const deleted = await socialLinksService.delete(params.id);
      return sendSuccess(deleted, 'Social link deleted successfully');
    },
    {
      detail: {
        tags: ['Social Links'],
        summary: 'Delete social link (Admin only)',
      },
    }
  );
