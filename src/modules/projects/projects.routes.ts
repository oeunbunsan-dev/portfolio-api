import { Elysia } from 'elysia';
import { projectsService } from './projects.service';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from './projects.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { authPlugin, requireAdmin } from '@/plugins/auth.plugin';

export const projectsRoutes = new Elysia({ prefix: '/projects' })
  .use(authPlugin)
  .get(
    '/',
    async ({ query }) => {
      const validatedQuery = validateSchema(projectQuerySchema, query);
      const { data, meta } = await projectsService.findAll(validatedQuery);
      return sendPaginated(data, meta, 'Projects retrieved successfully');
    },
    {
      detail: {
        tags: ['Projects'],
        summary: 'List projects with filtering, pagination, and search',
      },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const project = await projectsService.findByIdOrSlug(params.id);
      return sendSuccess(project, 'Project retrieved successfully');
    },
    {
      detail: {
        tags: ['Projects'],
        summary: 'Get project by ID or slug',
      },
    }
  )
  .post(
    '/',
    async ({ user, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(createProjectSchema, body);
      const created = await projectsService.create(validated);
      return sendSuccess(created, 'Project created successfully');
    },
    {
      detail: {
        tags: ['Projects'],
        summary: 'Create a new project (Admin only)',
      },
    }
  )
  .put(
    '/:id',
    async ({ user, params, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(updateProjectSchema, body);
      const updated = await projectsService.update(params.id, validated);
      return sendSuccess(updated, 'Project updated successfully');
    },
    {
      detail: {
        tags: ['Projects'],
        summary: 'Update an existing project (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const deleted = await projectsService.delete(params.id);
      return sendSuccess(deleted, 'Project deleted successfully');
    },
    {
      detail: {
        tags: ['Projects'],
        summary: 'Delete a project (Admin only)',
      },
    }
  );
