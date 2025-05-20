/**
 * Base application error class that extends the native Error class
 * All application-specific errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;

    // This is needed because we're extending a built-in class
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(
    message: string,
    code = 'RESOURCE_NOT_FOUND',
    context?: Record<string, any>
  ) {
    super(message, 404, code, context);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when a resource already exists
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    code = 'RESOURCE_CONFLICT',
    context?: Record<string, any>
  ) {
    super(message, 409, code, context);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Error thrown when a validation fails
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    code = 'VALIDATION_ERROR',
    context?: Record<string, any>
  ) {
    super(message, 400, code, context);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when a user is not authorized to perform an action
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    code = 'UNAUTHORIZED',
    context?: Record<string, any>
  ) {
    super(message, 401, code, context);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error thrown when a user doesn't have permission to access a resource
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string,
    code = 'FORBIDDEN',
    context?: Record<string, any>
  ) {
    super(message, 403, code, context);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Error thrown when there's a database-related error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code = 'DATABASE_ERROR',
    context?: Record<string, any>
  ) {
    super(message, 500, code, context);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}