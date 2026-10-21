const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createBudgetValidator,
  updateBudgetValidator,
} = require('../validators/budgetValidator');

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(createBudgetValidator, validateRequest, createBudget);

router.route('/:id')
  .put(updateBudgetValidator, validateRequest, updateBudget)
  .delete(deleteBudget);

module.exports = router;
