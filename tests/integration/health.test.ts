import { describe, expect, it } from 'bun:test';
import { app } from '@/app';

describe('System & Middleware Integration Tests', () => {
  it('GET / should return welcome message and documentation links', async () => {
    const res = await app.handle(new Request('http://localhost/'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Portfolio REST API');
    expect(body.data.documentation).toBe('/swagger');
  });

  it('GET /api/health should return system status and memory metrics', async () => {
    const res = await app.handle(new Request('http://localhost/api/health'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.status).toBeDefined();
    expect(body.data.uptime).toBeDefined();
    expect(body.data.memory).toBeDefined();
  });

  it('GET /api/unknown-endpoint should return standardized 404 error format', async () => {
    const res = await app.handle(new Request('http://localhost/api/unknown-endpoint'));
    expect(res.status).toBe(404);

    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(body.timestamp).toBeDefined();
  });

  it('should include security headers on HTTP responses', async () => {
    const res = await app.handle(new Request('http://localhost/'));
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(res.headers.get('Strict-Transport-Security')).toBeDefined();
  });

  it('should include rate limit headers on requests', async () => {
    const res = await app.handle(new Request('http://localhost/'));
    expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
  });
});
