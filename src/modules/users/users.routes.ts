import { Elysia } from 'elysia';
import { usersService } from './users.service';
import { updateProfileSchema, updateUserRoleSchema, userQuerySchema } from './users.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { authPlugin, requireAuth, requireAdmin } from '@/plugins/auth.plugin';

export const usersRoutes = new Elysia({ prefix: '/users' })
  .use(authPlugin)
  .get(
    '/me',
    async ({ user }) => {
      const verified = requireAuth({ user });
      const profile = await usersService.getProfile(verified.id);
      return sendSuccess(profile, 'Profile retrieved successfully');
    },
    {
      detail: {
        tags: ['Users'],
        summary: 'Get current user profile',
      },
    }
  )
  .put(
    '/profile',
    async ({ user, body }) => {
      const verified = requireAuth({ user });
      const validated = validateSchema(updateProfileSchema, body);
      const updated = await usersService.updateProfile(verified.id, validated);
      return sendSuccess(updated, 'Profile updated successfully');
    },
    {
      detail: {
        tags: ['Users'],
        summary: 'Update current user profile',
      },
    }
  )
  .get(
    '/',
    async ({ user, query }) => {
      requireAdmin({ user });
      const validatedQuery = validateSchema(userQuerySchema, query);
      const { data, meta } = await usersService.findAll(validatedQuery);
      return sendPaginated(data, meta, 'Users retrieved successfully');
    },
    {
      detail: {
        tags: ['Users'],
        summary: 'List users (Admin only)',
      },
    }
  )
  .get(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const found = await usersService.findById(params.id);
      return sendSuccess(found, 'User retrieved successfully');
    },
    {
      detail: {
        tags: ['Users'],
        summary: 'Get user by ID (Admin only)',
      },
    }
  )
  .put(
    '/:id/role',
    async ({ user, params, body }) => {
      const admin = requireAdmin({ user });
      const validated = validateSchema(updateUserRoleSchema, body);
      const updated = await usersService.updateRole(params.id, validated, admin.id);
      return sendSuccess(updated, 'User role updated successfully');
    },
    {
      detail: {
        tags: ['Users'],
        summary: 'Update user role (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      const admin = requireAdmin({ user });
      const deleted = await usersService.deleteUser(params.id, admin.id);
      return sendSuccess(deleted, 'User deleted successfully');
    },
    {
      detail: {
        tags: ['Users'],
        summary: 'Delete user (Admin only)',
      },
    }
  );
