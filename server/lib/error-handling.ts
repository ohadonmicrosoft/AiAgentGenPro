import { logger } from "./logger";

/**
 * Base application error class
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, 409);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends AppError {
  errors?: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors?: Record<string, string[]>,
  ) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 429 Too Many Requests Error
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}

/**
 * Error handler middleware for Express
 */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error(err);

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const validationErrors: Record<string, string[]> = {};
    err.errors.forEach((error: any) => {
      const path = error.path.join(".");
      if (!validationErrors[path]) {
        validationErrors[path] = [];
      }
      validationErrors[path].push(error.message);
    });

    return res.status(422).json({
      error: "Validation failed",
      errors: validationErrors,
    });
  }

  // Handle known AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      errors: (err as ValidationError).errors,
    });
  }

  // Handle Firebase auth errors
  if (err.code && err.code.startsWith("auth/")) {
    return res.status(401).json({
      error: err.message || "Authentication error",
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    error: "Internal server error",
  });
};

/**
 * Handles error logging and creates appropriate response
 * @param error The error to handle
 * @param includeDetails Whether to include error details in the response
 * @returns Standardized error response object
 */
export function handleError(
  error: unknown,
  includeDetails = false,
): {
  error: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
} {
  // Handle AppError instances
  if (error instanceof AppError) {
    logger.error(`[${error.name}] ${error.message}`, {
      name: error.name,
      stack: error.stack,
    });

    return {
      error: error.message,
      code: error.name,
      statusCode: error.statusCode,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    logger.error(`Unhandled error: ${error.message}`);
    return {
      error: "An unexpected error occurred",
      code: "UnknownError",
      statusCode: 500,
    };
  }

  // Default error response
  logger.error(`Unknown error type: ${String(error)}`);
  return {
    error: "An unexpected error occurred",
    code: "UnknownError",
    statusCode: 500,
  };
}
