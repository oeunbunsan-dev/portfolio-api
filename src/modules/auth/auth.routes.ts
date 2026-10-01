import { Elysia } from 'elysia';
import { authService } from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { validateSchema } from '@/utils/validation';
import { sendSuccess } from '@/utils/response';
import { authPlugin, requireAuth } from '@/plugins/auth.plugin';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authPlugin)
  .post(
    '/register',
    async ({ body, jwtAccess, jwtRefresh }) => {
      const validated = validateSchema(registerSchema, body);
      const result = await authService.register(validated, jwtAccess, jwtRefresh);
      return sendSuccess(result, 'User registered successfully');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        description: 'Creates a new user profile with standard USER role and returns JWT tokens.',
      },
    }
  )
  .post(
    '/login',
    async ({ body, jwtAccess, jwtRefresh }) => {
      const validated = validateSchema(loginSchema, body);
      const result = await authService.login(validated, jwtAccess, jwtRefresh);
      return sendSuccess(result, 'Login successful');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Authenticate user credentials',
        description: 'Verifies email and password, returning an access token and refresh token.',
      },
    }
  )
  .post(
    '/refresh',
    async ({ body, jwtAccess, jwtRefresh }) => {
      const validated = validateSchema(refreshTokenSchema, body);
      const result = await authService.refreshToken(validated.refreshToken, jwtAccess, jwtRefresh);
      return sendSuccess(result, 'Token refreshed successfully');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Refresh expired access token',
        description: 'Provides a new access token and rotated refresh token using a valid refresh token.',
      },
    }
  )
  .post(
    '/logout',
    async ({ body }) => {
      const validated = validateSchema(refreshTokenSchema, body);
      await authService.logout(validated.refreshToken);
      return sendSuccess({ loggedOut: true }, 'Successfully logged out');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Logout and revoke refresh token',
        description: 'Invalidates the specified refresh token in the database.',
      },
    }
  )
  .get(
    '/me',
    async ({ user }) => {
      const currentUser = requireAuth({ user });
      return sendSuccess(currentUser, 'Current user profile retrieved');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        description: 'Returns profile details for the currently authenticated bearer token.',
      },
    }
  );
