const { check, param } = require('express-validator');

const createBudgetValidator = [
  check('amount')
    .notEmpty()
    .withMessage('Budget limit amount is required')
    .isFloat({ min: 1, max: 1000000000 })
    .withMessage('Budget amount must be at least 1'),
  check('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  check('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
  check('category')
    .optional({ nullable: true })
    .custom((val) => {
      if (!val) return true;
      if (!/^[0-9a-fA-F]{24}$/.test(val)) {
        throw new Error('Category must be a valid Mongo ObjectId or null for overall budget');
      }
      return true;
    }),
  check('alertThreshold')
    .optional()
    .isInt({ min: 10, max: 100 })
    .withMessage('Alert threshold must be between 10% and 100%'),
];

const updateBudgetValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid budget ID parameter'),
  check('amount')
    .optional()
    .isFloat({ min: 1, max: 1000000000 })
    .withMessage('Budget amount must be at least 1'),
  check('alertThreshold')
    .optional()
    .isInt({ min: 10, max: 100 })
    .withMessage('Alert threshold must be between 10% and 100%'),
];

module.exports = { createBudgetValidator, updateBudgetValidator };
