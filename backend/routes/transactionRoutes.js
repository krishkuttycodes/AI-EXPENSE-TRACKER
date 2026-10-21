const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  exportCSV,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createTransactionValidator,
  updateTransactionValidator,
} = require('../validators/transactionValidator');

router.use(protect);

router.get('/export/csv', exportCSV);

router.route('/')
  .get(getTransactions)
  .post(createTransactionValidator, validateRequest, createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransactionValidator, validateRequest, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
