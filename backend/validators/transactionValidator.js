const { check, param } = require('express-validator');

const createTransactionValidator = [
  check('type')
    .trim()
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either "income" or "expense"'),
  check('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01, max: 1000000000 })
    .withMessage('Amount must be a positive number greater than 0'),
  check('category')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  check('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date string (e.g. YYYY-MM-DD)'),
  check('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
  check('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  check('recurringFrequency')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid recurring frequency'),
];

const updateTransactionValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID parameter'),
  check('type')
    .optional()
    .trim()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either "income" or "expense"'),
  check('amount')
    .optional()
    .isFloat({ min: 0.01, max: 1000000000 })
    .withMessage('Amount must be a positive number greater than 0'),
  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID format'),
  check('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date string'),
  check('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
];

module.exports = { createTransactionValidator, updateTransactionValidator };
