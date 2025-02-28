import React from "react";

/**
 * Application-specific error class that provides additional context for errors
 */
export class AppError extends Error {
  /** Error code for categorization and handling */
  code: string;

  /** Additional context or data related to the error */
  context?: Record<string, unknown>;

  /** HTTP status code if applicable */
  status?: number;

  /**
   * Create a new application error
   *
   * @param message - Human-readable error message
   * @param code - Error code for categorization (e.g., 'AUTH_FAILED', 'NETWORK_ERROR')
   * @param context - Additional context or data related to the error
   * @param status - HTTP status code if applicable
   */
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    status?: number,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
    this.status = status;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Network error for failed API requests
 */
export class NetworkError extends AppError {
  constructor(
    message = "Network request failed",
    context?: Record<string, unknown>,
  ) {
    super(message, "NETWORK_ERROR", context);
    this.name = "NetworkError";

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Authentication error for auth-related failures
 */
export class AuthError extends AppError {
  constructor(
    message = "Authentication failed",
    context?: Record<string, unknown>,
  ) {
    super(message, "AUTH_ERROR", context);
    this.name = "AuthError";

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Validation error for form or data validation failures
 */
export class ValidationError extends AppError {
  /** Field-specific validation errors */
  fieldErrors: Record<string, string>;

  constructor(
    message = "Validation failed",
    fieldErrors: Record<string, string> = {},
    context?: Record<string, unknown>,
  ) {
    super(message, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error codes used throughout the application
 */
export enum ErrorCode {
  UNKNOWN = "UNKNOWN_ERROR",
  NETWORK = "NETWORK_ERROR",
  AUTH = "AUTH_ERROR",
  VALIDATION = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  SERVER_ERROR = "SERVER_ERROR",
  TIMEOUT = "TIMEOUT",
  RATE_LIMITED = "RATE_LIMITED",
  OFFLINE = "OFFLINE",
}

/**
 * Get a user-friendly error message based on the error
 *
 * @param error - The error object
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    // For validation errors, return the first field error or the general message
    const firstFieldError = Object.values(error.fieldErrors)[0];
    return firstFieldError || error.message;
  }

  if (error instanceof AuthError) {
    return "Authentication failed. Please sign in again.";
  }

  if (error instanceof NetworkError) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  if (error instanceof AppError) {
    // For other known error types, use their message
    return error.message;
  }

  if (error instanceof Error) {
    // For standard errors, use a generic message in production
    return process.env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again."
      : error.message;
  }

  // For unknown errors (not Error instances)
  return "Something went wrong. Please try again later.";
}

/**
 * Handle an error by logging and optionally reporting it
 *
 * @param error - The error to handle
 * @param options - Error handling options
 * @returns A user-friendly error message
 */
export function handleError(
  error: unknown,
  options: {
    context?: Record<string, unknown>;
    silent?: boolean;
    reportToAnalytics?: boolean;
  } = {},
): string {
  const { context = {}, silent = false, reportToAnalytics = true } = options;

  // Log to console in development
  if (process.env.NODE_ENV !== "production" && !silent) {
    console.group("Application Error");
    console.error(error);

    if (Object.keys(context).length > 0) {
      console.error("Error Context:", context);
    }

    console.groupEnd();
  }

  // Report to error monitoring service in production
  if (process.env.NODE_ENV === "production" && reportToAnalytics) {
    try {
      // Here you would integrate with your error reporting service
      // Example: Sentry.captureException(error, { extra: context });

      // For now, just log that we would report this
      console.log(
        "[Error Reporting] Would report error to monitoring service:",
        {
          error,
          context,
        },
      );
    } catch (reportingError) {
      // Ensure reporting failures don't cause additional problems
      console.error("Failed to report error:", reportingError);
    }
  }

  return getUserFriendlyErrorMessage(error);
}

/**
 * Safely parse JSON with error handling
 *
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    handleError(error, {
      context: { json: json.substring(0, 100) },
      silent: true,
    });
    return fallback;
  }
}

/**
 * Create an error object from an HTTP response
 *
 * @param response - Fetch Response object
 * @param data - Response data if already parsed
 * @returns AppError instance
 */
export async function createErrorFromResponse(
  response: Response,
  data?: any,
): Promise<AppError> {
  // Parse response data if not provided
  if (!data) {
    try {
      data = await response.json();
    } catch {
      // If JSON parsing fails, use text content
      try {
        data = { message: await response.text() };
      } catch {
        // If everything fails, use status text
        data = { message: response.statusText || "Unknown error" };
      }
    }
  }

  const message =
    data.message || `Request failed with status ${response.status}`;
  let errorCode = ErrorCode.UNKNOWN;

  // Map HTTP status codes to error codes
  switch (response.status) {
    case 401:
      errorCode = ErrorCode.AUTH;
      break;
    case 403:
      errorCode = ErrorCode.PERMISSION_DENIED;
      break;
    case 404:
      errorCode = ErrorCode.NOT_FOUND;
      break;
    case 408:
      errorCode = ErrorCode.TIMEOUT;
      break;
    case 429:
      errorCode = ErrorCode.RATE_LIMITED;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      errorCode = ErrorCode.SERVER_ERROR;
      break;
    default:
      if (response.status >= 400 && response.status < 500) {
        errorCode = ErrorCode.VALIDATION;
      } else if (response.status >= 500) {
        errorCode = ErrorCode.SERVER_ERROR;
      }
      break;
  }

  return new AppError(message, errorCode, data, response.status);
}

/**
 * A simple component to display form error messages
 */
export const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  if (!children) return null;
  
  return (
    <p className="text-sm font-medium text-destructive mt-1">{children}</p>
  );
};

/**
 * Helper function to get form error messages from form state
 */
export function getFormErrorMessage(
  errors: Record<string, any> | undefined,
  field: string
): string | undefined {
  return errors?.[field]?.message;
}

/**
 * Error handler for API request errors
 */
export function handleApiError(error: unknown): string {
  console.error("API Error:", error);
  
  if (typeof error === "string") {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred. Please try again.";
}

/**
 * Generic error boundary component
 */
export class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
