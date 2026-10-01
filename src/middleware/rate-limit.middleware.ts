import { Elysia } from 'elysia';
import { config } from '@/config';
import { RateLimitError } from '@/utils/error';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipHits = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipHits.entries()) {
    if (now > record.resetAt) {
      ipHits.delete(ip);
    }
  }
}, 60000);

export function checkRateLimit(
  request: Request,
  set: { headers: Record<string, string | undefined> },
  options?: { max?: number; windowMs?: number }
) {
  const max = options?.max ?? config.rateLimit.max;
  const windowMs = options?.windowMs ?? config.rateLimit.windowMs;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'anonymous-client';

  const now = Date.now();
  const record = ipHits.get(ip);

  if (!record || now > record.resetAt) {
    ipHits.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });

    set.headers['X-RateLimit-Limit'] = String(max);
    set.headers['X-RateLimit-Remaining'] = String(max - 1);
    set.headers['X-RateLimit-Reset'] = String(Math.ceil((now + windowMs) / 1000));
    return;
  }

  record.count += 1;
  const remaining = Math.max(0, max - record.count);

  set.headers['X-RateLimit-Limit'] = String(max);
  set.headers['X-RateLimit-Remaining'] = String(remaining);
  set.headers['X-RateLimit-Reset'] = String(Math.ceil(record.resetAt / 1000));

  if (record.count > max) {
    set.headers['Retry-After'] = String(Math.ceil((record.resetAt - now) / 1000));
    throw new RateLimitError(`Rate limit exceeded. Maximum ${max} requests per ${windowMs / 1000}s allowed.`);
  }
}

export function createRateLimiter(options?: { max?: number; windowMs?: number }) {
  return new Elysia({ name: 'rate-limiter' }).onBeforeHandle(
    { as: 'global' },
    ({ request, set }) => {
      checkRateLimit(request, set as any, options);
    }
  );
}

export const rateLimiter = createRateLimiter();
