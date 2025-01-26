import ApiErrorTypes from '../types/error';

class AppError extends Error {
  statusCode: number;

  isOperational: boolean;

  message: string;

  type: ApiErrorTypes;

  details?: any;

  constructor(
    statusCode: number,
    type: ApiErrorTypes,
    message: string,
    details?: any,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.message = message;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
