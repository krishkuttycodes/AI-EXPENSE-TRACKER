const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const ApiError = require('../utils/apiError');

/**
 * Create a new transaction
 * POST /api/transactions
 */
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, note, date, isRecurring, recurringFrequency } = req.body;

    // Validate category exists and is either system default or owned by this user
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return next(ApiError.badRequest('Selected category does not exist.'));
    }

    if (categoryDoc.user && categoryDoc.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Unauthorized to use a category belonging to another user.'));
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      note: note ? note.trim() : '',
      date: date ? new Date(date) : new Date(),
      isRecurring: Boolean(isRecurring),
      recurringFrequency: recurringFrequency || 'none',
    });

    const populatedTransaction = await Transaction.findById(transaction._id).populate('category', 'name type icon color');

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: {
        transaction: populatedTransaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get filtered, paginated transactions for the authenticated user
 * GET /api/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      search,
      startDate,
      endDate,
      month,
      year,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { user: req.user._id };

    // Filter by type
    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }

    // Filter by category
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    }

    // Filter by note search
    if (search && search.trim()) {
      filter.note = { $regex: search.trim(), $options: 'i' };
    }

    // Date boundary handling
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startOfMonth = new Date(Date.UTC(y, m - 1, 1));
      const endOfMonth = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      filter.date = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const sortOptions = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'amount') {
      sortOptions.amount = order;
    } else {
      sortOptions.date = order;
      sortOptions._id = order;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Run queries concurrently
    const [transactions, totalCount, totals] = await Promise.all([
      Transaction.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name type icon color'),
      Transaction.countDocuments(filter),
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    let filteredIncome = 0;
    let filteredExpense = 0;
    totals.forEach((t) => {
      if (t._id === 'income') filteredIncome = t.total;
      if (t._id === 'expense') filteredExpense = t.total;
    });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount,
          page: pageNum,
          pages: Math.ceil(totalCount / limitNum) || 1,
          limit: limitNum,
        },
        summary: {
          income: Number(filteredIncome.toFixed(2)),
          expense: Number(filteredExpense.toFixed(2)),
          balance: Number((filteredIncome - filteredExpense).toFixed(2)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single transaction by ID with ownership verification
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('category', 'name type icon color');

    if (!transaction) {
      return next(ApiError.notFound('Transaction not found'));
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You do not own this transaction.'));
    }

    res.status(200).json({
      success: true,
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update transaction by ID with ownership verification
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, note, date, isRecurring, recurringFrequency } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return next(ApiError.notFound('Transaction not found'));
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You do not own this transaction.'));
    }

    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return next(ApiError.badRequest('Category does not exist'));
      }
      if (categoryDoc.user && categoryDoc.user.toString() !== req.user._id.toString()) {
        return next(ApiError.forbidden('Cannot assign category belonging to another user.'));
      }
      transaction.category = category;
    }

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (note !== undefined) transaction.note = note.trim();
    if (date) transaction.date = new Date(date);
    if (isRecurring !== undefined) transaction.isRecurring = Boolean(isRecurring);
    if (recurringFrequency !== undefined) transaction.recurringFrequency = recurringFrequency;

    await transaction.save();

    const updated = await Transaction.findById(transaction._id).populate('category', 'name type icon color');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: {
        transaction: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete transaction by ID with ownership verification
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return next(ApiError.notFound('Transaction not found'));
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You do not own this transaction.'));
    }

    await Transaction.findByIdAndDelete(transaction._id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export filtered transactions as CSV for the authenticated user
 * GET /api/transactions/export/csv
 */
const exportCSV = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, month, year } = req.query;
    const filter = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    }
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      filter.date = {
        $gte: new Date(Date.UTC(y, m - 1, 1)),
        $lte: new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)),
      };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate('category', 'name');

    // Build CSV safely escaping strings
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    let csvContent = 'Date,Type,Category,Amount (INR),Note,Is Recurring,Recurring Frequency\r\n';

    transactions.forEach((tx) => {
      const dateStr = tx.date ? new Date(tx.date).toISOString().split('T')[0] : '';
      const typeStr = tx.type;
      const categoryName = tx.category?.name || 'Uncategorized';
      const amountStr = tx.amount.toFixed(2);
      const noteStr = tx.note || '';
      const isRec = tx.isRecurring ? 'Yes' : 'No';
      const freq = tx.recurringFrequency || 'none';

      csvContent += `${escapeCsv(dateStr)},${escapeCsv(typeStr)},${escapeCsv(categoryName)},${amountStr},${escapeCsv(noteStr)},${escapeCsv(isRec)},${escapeCsv(freq)}\r\n`;
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="expense-tracker-${timestamp}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  exportCSV,
};
