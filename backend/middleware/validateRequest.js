const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Middleware to check express-validator validation results
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(new ApiError(400, 'Validation failed. Please correct input fields.', extractedErrors));
  }
  next();
};

module.exports = validateRequest;
