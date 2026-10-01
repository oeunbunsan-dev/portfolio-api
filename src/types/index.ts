import { Role } from '@prisma/client';

export type UserRole = Role;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface ApiPaginationResponse<T = any> {
  success: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  exp?: number;
  iat?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
}

export type SortOrder = 'asc' | 'desc';

export interface BaseQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}
