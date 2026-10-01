import type { SortOrder } from '@/types';

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(page?: number | string, limit?: number | string): ParsedPagination {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
}

export function parseSortOrder(sortOrder?: string): SortOrder {
  return sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
}
