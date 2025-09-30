import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Default error
  let error = {
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
  };

  // Validation errors (Celebrate/Joi)
  if (err.joi) {
    error = {
      message: 'Validation Error',
      code: 'VALIDATION_ERROR',
      details: err.joi.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    };
    return res.status(400).json({ error });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    error = {
      message: 'A record with this data already exists',
      code: 'DUPLICATE_ERROR',
      field: err.meta?.target?.[0],
    };
    return res.status(409).json({ error });
  }

  if (err.code === 'P2025') {
    error = {
      message: 'Record not found',
      code: 'NOT_FOUND',
    };
    return res.status(404).json({ error });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    };
    return res.status(401).json({ error });
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    };
    return res.status(401).json({ error });
  }

  // Custom app errors
  if (err.statusCode) {
    error = {
      message: err.message,
      code: err.code || 'APP_ERROR',
    };
    return res.status(err.statusCode).json({ error });
  }

  // Default 500 error
  res.status(500).json({ error });
};

export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}