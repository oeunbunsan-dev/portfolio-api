import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { config } from '@/config';
import { prisma } from '@/database/client';
import { UnauthorizedError, ForbiddenError } from '@/utils/error';
import type { AuthUser, TokenPayload } from '@/types';

export const jwtAccessPlugin = jwt({
  name: 'jwtAccess',
  secret: config.jwt.accessSecret,
  exp: config.jwt.accessExpiresIn,
});

export const jwtRefreshPlugin = jwt({
  name: 'jwtRefresh',
  secret: config.jwt.refreshSecret,
  exp: config.jwt.refreshExpiresIn,
});

export const authPlugin = new Elysia({ name: 'auth-plugin' })
  .use(jwtAccessPlugin)
  .use(jwtRefreshPlugin)
  .derive({ as: 'scoped' }, async ({ request, jwtAccess }): Promise<{ user: AuthUser | null }> => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return { user: null };
    }

    try {
      const payload = (await jwtAccess.verify(token)) as unknown as TokenPayload | false;
      if (!payload || !payload.sub) {
        return { user: null };
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
        },
      });

      return { user: user ?? null };
    } catch {
      return { user: null };
    }
  });

export function requireAuth({ user }: { user: AuthUser | null }) {
  if (!user) {
    throw new UnauthorizedError('Authentication required. Please provide a valid Bearer token.');
  }
  return user;
}

export function requireAdmin({ user }: { user: AuthUser | null }) {
  const verifiedUser = requireAuth({ user });
  if (verifiedUser.role !== 'ADMIN') {
    throw new ForbiddenError('Access denied. Administrator privileges required.');
  }
  return verifiedUser;
}
