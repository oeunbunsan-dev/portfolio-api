import type { ApiResponse, ApiPaginationResponse, PaginationMeta } from '@/types';

export function sendSuccess<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    ...(message ? { message } : {}),
    data,
    timestamp: new Date().toISOString(),
  };
}

export function sendPaginated<T>(
  data: T[],
  meta: PaginationMeta,
  message?: string
): ApiPaginationResponse<T> {
  return {
    success: true,
    ...(message ? { message } : {}),
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

export function calculatePagination(
  total: number,
  page = 1,
  limit = 10
): PaginationMeta {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const totalPages = Math.ceil(total / safeLimit) || 1;

  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
