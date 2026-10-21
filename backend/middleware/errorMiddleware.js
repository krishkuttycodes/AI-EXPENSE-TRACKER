const ApiError = require('../utils/apiError');

/**
 * Handle 404 Route Not Found
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Endpoint not found: ${req.originalUrl}`));
};

/**
 * Global Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid format for resource identifier (${err.path})`;
    error = ApiError.badRequest(message);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = ApiError.conflict(message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = ApiError.badRequest('Database validation failed', messages);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authorization token');
  }

  const responsePayload = {
    success: false,
    message: error.message || 'Server Internal Error',
  };

  if (error.errors && error.errors.length > 0) {
    responsePayload.errors = error.errors;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(responsePayload);
};

module.exports = { notFound, errorHandler };
