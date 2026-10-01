import { describe, expect, it } from 'bun:test';
import { sendSuccess, sendPaginated, calculatePagination } from '@/utils/response';

describe('Response Formatter Utility', () => {
  it('should format standard success responses with timestamp', () => {
    const data = { id: 'test-123', name: 'Sample' };
    const response = sendSuccess(data, 'Item retrieved');

    expect(response.success).toBe(true);
    expect(response.message).toBe('Item retrieved');
    expect(response.data).toEqual(data);
    expect(response.timestamp).toBeDefined();
    expect(new Date(response.timestamp).getTime()).not.toBeNaN();
  });

  it('should calculate pagination metadata accurately', () => {
    const total = 55;
    const page = 2;
    const limit = 10;

    const meta = calculatePagination(total, page, limit);

    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(10);
    expect(meta.total).toBe(55);
    expect(meta.totalPages).toBe(6);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(true);
  });

  it('should handle first page hasPrev=false and last page hasNext=false', () => {
    const firstPage = calculatePagination(30, 1, 10);
    expect(firstPage.hasPrev).toBe(false);
    expect(firstPage.hasNext).toBe(true);

    const lastPage = calculatePagination(30, 3, 10);
    expect(lastPage.hasPrev).toBe(true);
    expect(lastPage.hasNext).toBe(false);
  });

  it('should format paginated API response structure', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const meta = calculatePagination(2, 1, 10);
    const res = sendPaginated(items, meta, 'Items retrieved');

    expect(res.success).toBe(true);
    expect(res.data.length).toBe(2);
    expect(res.meta.total).toBe(2);
    expect(res.message).toBe('Items retrieved');
  });
});
