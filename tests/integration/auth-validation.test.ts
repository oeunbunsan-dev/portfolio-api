import { describe, expect, it } from 'bun:test';
import { app } from '@/app';

describe('Auth & Validation Integration Tests', () => {
  it('POST /api/auth/register should return 422 if body is invalid', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A', // too short
          email: 'not-an-email',
          password: '123', // too short and missing uppercase
        }),
      })
    );

    expect(res.status).toBe(422);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toBeDefined();
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login should return 422 if required fields are missing', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );

    expect(res.status).toBe(422);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/users/me should reject unauthenticated requests with 401', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/users/me', {
        method: 'GET',
      })
    );

    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/projects should reject unauthorized non-admin requests with 401', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Project',
          description: 'This is a test description exceeding 10 chars',
          content: 'This is test content exceeding 10 chars',
          technologies: ['TypeScript'],
        }),
      })
    );

    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});
