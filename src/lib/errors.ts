/**
 * Error handling utilities
 */

/**
 * Standard application error interface
 */
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Safely extract error message from unknown error
 * @param error - Unknown error object
 * @returns Error message string
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

/**
 * Convert unknown error to AppError
 * @param error - Unknown error object
 * @returns AppError object
 */
export const toAppError = (error: unknown): AppError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'name' in error ? String(error.name) : undefined,
      details: error
    };
  }
  return {
    message: getErrorMessage(error),
    details: error
  };
};
