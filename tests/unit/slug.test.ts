import { describe, expect, it } from 'bun:test';
import { slugify } from '@/utils/slug';

describe('Slug Generator Utility', () => {
  it('should convert titles to lowercase hyphenated slugs', () => {
    const title = 'CloudScale Distributed Microservices Architecture';
    const slug = slugify(title);
    expect(slug).toBe('cloudscale-distributed-microservices-architecture');
  });

  it('should remove special characters and accents', () => {
    const title = 'AI & Machine Learning: The Future of API Design! (2026)';
    const slug = slugify(title);
    expect(slug).toBe('ai-machine-learning-the-future-of-api-design-2026');
  });

  it('should trim leading and trailing hyphens', () => {
    const title = '--- Elysia Bun API ---';
    const slug = slugify(title);
    expect(slug).toBe('elysia-bun-api');
  });

  it('should collapse multiple consecutive spaces and hyphens into a single hyphen', () => {
    const title = 'Project    With   Multiple     Spaces---And---Dashes';
    const slug = slugify(title);
    expect(slug).toBe('project-with-multiple-spaces-and-dashes');
  });
});
