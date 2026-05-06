export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", code: string = "CONFLICT") {
    super(message, code, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation error", details?: any) {
    super(message, "VALIDATION_ERROR", 422, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", code: string = "BAD_REQUEST") {
    super(message, code, 400);
  }
}
