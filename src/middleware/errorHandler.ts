import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/error';
import logger from '../logger/logger';
import ApiErrorTypes from '../types/error';

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorType = err.type || ApiErrorTypes.ServerError;

  const errorResponse = {
    statusCode,
    message,
    type: errorType,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  };

  logger.error(err);
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
