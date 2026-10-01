import { Elysia } from 'elysia';
import { skillsService } from './skills.service';
import { createSkillSchema, updateSkillSchema, skillQuerySchema } from './skills.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authPlugin, requireAdmin } from '@/plugins/auth.plugin';

export const skillsRoutes = new Elysia({ prefix: '/skills' })
  .use(authPlugin)
  .get(
    '/',
    async ({ query }) => {
      const validatedQuery = validateSchema(skillQuerySchema, query);
      const skills = await skillsService.findAll(validatedQuery);
      return sendSuccess(skills, 'Skills retrieved successfully');
    },
    {
      detail: {
        tags: ['Skills'],
        summary: 'List all skills with optional category filter and sorting',
      },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const skill = await skillsService.findById(params.id);
      return sendSuccess(skill, 'Skill retrieved successfully');
    },
    {
      detail: {
        tags: ['Skills'],
        summary: 'Get skill by ID',
      },
    }
  )
  .post(
    '/',
    async ({ user, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(createSkillSchema, body);
      const created = await skillsService.create(validated);
      return sendSuccess(created, 'Skill created successfully');
    },
    {
      detail: {
        tags: ['Skills'],
        summary: 'Create a new skill (Admin only)',
      },
    }
  )
  .put(
    '/:id',
    async ({ user, params, body }) => {
      requireAdmin({ user });
      const validated = validateSchema(updateSkillSchema, body);
      const updated = await skillsService.update(params.id, validated);
      return sendSuccess(updated, 'Skill updated successfully');
    },
    {
      detail: {
        tags: ['Skills'],
        summary: 'Update skill (Admin only)',
      },
    }
  )
  .delete(
    '/:id',
    async ({ user, params }) => {
      requireAdmin({ user });
      const deleted = await skillsService.delete(params.id);
      return sendSuccess(deleted, 'Skill deleted successfully');
    },
    {
      detail: {
        tags: ['Skills'],
        summary: 'Delete skill (Admin only)',
      },
    }
  );
