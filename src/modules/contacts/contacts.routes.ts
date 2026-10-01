import { Elysia } from 'elysia';
import { contactsService } from './contacts.service';
import {
  createContactSchema,
  contactQuerySchema,
  updateContactStatusSchema,
} from './contacts.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { authPlugin, requireAdmin } from '@/plugins/auth.plugin';
import { checkRateLimit } from '@/middleware/rate-limit.middleware';

export const contactsRoutes = new Elysia({ prefix: '/contact' })
  .use(authPlugin)
  .post(
    '/',
    async ({ body }) => {
      const validated = validateSchema(createContactSchema, body);
      const created = await contactsService.create(validated);
      return sendSuccess(
        { id: created.id, createdAt: created.createdAt },
        'Thank you! Your message has been received.'
      );
    },
    {
      beforeHandle: ({ request, set }) => {
        checkRateLimit(request, set as any, { max: 5, windowMs: 10 * 60 * 1000 });
      },
      detail: {
        tags: ['Contact'],
        summary: 'Submit a new contact message (Public, Rate-limited)',
      },
    }
  )
  .get(
    '/',
    async ({ user, query }) => {
      requireAdmin({ user });
      const validatedQuery = validateSchema(contactQuerySchema, query);
      const { data, meta } = await contactsService.findAll(validatedQuery);
      return sendPaginated(data, meta, 'Contact messages retrieved successfully');
    },
    {
      detail: {
        tags: ['Contact'],
        summary: 'List contact messages (Admin only)',
      },
    }
  )
  .get(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const message = await contactsService.findById(params.id);
      return sendSuccess(message, 'Contact message retrieved successfully');
    },
    {
      detail: {
        tags: ['Contact'],
        summary: 'Get message details and mark as read (Admin only)',
      },
    }
  )
  .put(
    '/:id/status',
    async ({ user, params, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(updateContactStatusSchema, body);
      const updated = await contactsService.updateStatus(params.id, validated.isRead);
      return sendSuccess(updated, 'Message status updated successfully');
    },
    {
      detail: {
        tags: ['Contact'],
        summary: 'Update message read status (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const deleted = await contactsService.delete(params.id);
      return sendSuccess(deleted, 'Contact message deleted successfully');
    },
    {
      detail: {
        tags: ['Contact'],
        summary: 'Delete contact message (Admin only)',
      },
    }
  );
