import { Prisma } from '@prisma/client';
import { AppError } from '@/utils/error';

export function handleError({ code, error, set }: any) {
  const timestamp = new Date().toISOString();

  // 1. Handled AppError instances
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      timestamp,
    };
  }

  // 2. Prisma Known Request Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) || [];
        set.status = 409;
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: `A record with this ${target.join(', ')} already exists`,
            details: { fields: target },
          },
          timestamp,
        };
      }
      case 'P2025': {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'The requested record was not found',
          },
          timestamp,
        };
      }
      case 'P2003': {
        set.status = 400;
        return {
          success: false,
          error: {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Foreign key constraint failed',
          },
          timestamp,
        };
      }
      default: {
        set.status = 400;
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'A database error occurred',
            details: error.message,
          },
          timestamp,
        };
      }
    }
  }

  // 3. Prisma Client Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    set.status = 400;
    return {
      success: false,
      error: {
        code: 'DATABASE_VALIDATION_ERROR',
        message: 'Invalid data provided to database operation',
      },
      timestamp,
    };
  }

  // 4. Elysia Built-in Errors
  if (code === 'NOT_FOUND') {
    set.status = 404;
    return {
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested API route was not found',
      },
      timestamp,
    };
  }

  if (code === 'VALIDATION') {
    set.status = 422;
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request schema validation failed',
        details: (error as any).all || error.message,
      },
      timestamp,
    };
  }

  // 5. Default Unhandled Server Error
  console.error('💥 Unhandled Exception:', error);
  set.status = 500;
  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
    },
    timestamp,
  };
}
