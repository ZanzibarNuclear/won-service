import { AppError, DatabaseError } from '../errors/AppError'

/**
 * A utility function to wrap database operations with consistent error handling
 * 
 * @param operation - The database operation to execute
 * @param errorMessage - The error message to use if the operation fails
 * @param errorCode - The error code to use if the operation fails
 * @param context - Additional context to include in the error
 * @returns The result of the operation
 * @throws AppError - If the operation fails
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  errorCode = 'DATABASE_ERROR',
  context: Record<string, any> = {}
): Promise<T> {
  try {
    return await operation()
  } catch (error: unknown) {
    // Re-throw AppErrors as they are already properly formatted
    if (error instanceof AppError) {
      throw error
    }

    // Extract error message safely
    const errorMsg = error instanceof Error
      ? error.message
      : String(error);

    // Wrap other errors in DatabaseError
    throw new DatabaseError(
      `${errorMessage}: ${errorMsg}`,
      errorCode,
      {
        ...context,
        originalError: error instanceof Error
          ? { message: error.message, name: error.name, stack: error.stack }
          : String(error)
      }
    )
  }
}

/**
 * A utility function to check if a value exists and throw a specific error if it doesn't
 * 
 * @param value - The value to check
 * @param ErrorClass - The error class to throw if the value doesn't exist
 * @param message - The error message
 * @param code - The error code
 * @param context - Additional context to include in the error
 * @returns The value if it exists
 * @throws ErrorClass - If the value doesn't exist
 */
export function ensureExists<T>(
  value: T | null | undefined,
  ErrorClass: new (message: string, code: string, context?: Record<string, any>) => AppError,
  message: string,
  code: string,
  context: Record<string, any> = {}
): T {
  if (value === null || value === undefined) {
    throw new ErrorClass(message, code, context)
  }
  return value
}