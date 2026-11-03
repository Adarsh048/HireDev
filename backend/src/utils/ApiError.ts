/**
 * Custom operational error class for the API.
 * Carries an HTTP status code so the global error handler can respond correctly.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /** 400 Bad Request */
  static badRequest(message = 'Bad request') {
    return new ApiError(400, message);
  }

  /** 401 Unauthorized */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /** 403 Forbidden */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /** 404 Not Found */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /** 409 Conflict */
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  /** 500 Internal Server Error */
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, false);
  }
}
