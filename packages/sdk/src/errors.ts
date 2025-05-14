export class BeakDashError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'BeakDashError';
  }
}

export class AuthenticationError extends BeakDashError {
  constructor(message = 'Authentication failed', details?: Record<string, any>) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends BeakDashError {
  constructor(message = 'Validation failed', details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BeakDashError {
  constructor(message = 'Resource not found', details?: Record<string, any>) {
    super(message, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends BeakDashError {
  constructor(message = 'Rate limit exceeded', details?: Record<string, any>) {
    super(message, 'RATE_LIMIT', details);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends BeakDashError {
  constructor(message = 'Server error', details?: Record<string, any>) {
    super(message, 'SERVER_ERROR', details);
    this.name = 'ServerError';
  }
} 