import { Elysia } from 'elysia';

export const securityHeaders = new Elysia({ name: 'security-headers' }).onBeforeHandle(
  { as: 'global' },
  ({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff';
    set.headers['X-Frame-Options'] = 'DENY';
    set.headers['X-XSS-Protection'] = '1; mode=block';
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    set.headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
    set.headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  }
);
