import { describe, expect, it } from 'bun:test';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
} from '@/utils/error';

describe('Application Error Hierarchy', () => {
  it('should initialize AppError with custom status and code', () => {
    const err = new AppError('Custom failure', 503, 'SERVICE_UNAVAILABLE', { retries: 3 });
    expect(err.message).toBe('Custom failure');
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe('SERVICE_UNAVAILABLE');
    expect(err.details).toEqual({ retries: 3 });
  });

  it('should set appropriate HTTP status codes for subclass errors', () => {
    expect(new BadRequestError('Bad').statusCode).toBe(400);
    expect(new UnauthorizedError('Auth').statusCode).toBe(401);
    expect(new ForbiddenError('Denied').statusCode).toBe(403);
    expect(new NotFoundError('Missing').statusCode).toBe(404);
    expect(new ConflictError('Exists').statusCode).toBe(409);
    expect(new ValidationError('Invalid').statusCode).toBe(422);
    expect(new RateLimitError('Limited').statusCode).toBe(429);
  });
});
