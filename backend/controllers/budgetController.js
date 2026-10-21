const Budget = require('../models/Budget');
const Category = require('../models/Category');
const budgetService = require('../services/budgetService');
const ApiError = require('../utils/apiError');

/**
 * Get budgets with live spending progress
 * GET /api/budgets
 */
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    const budgets = await budgetService.getUserBudgetsWithProgress(req.user._id, month, year);

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        budgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new budget
 * POST /api/budgets
 */
const createBudget = async (req, res, next) => {
  try {
    const { amount, month, year, category, alertThreshold } = req.body;

    // Validate category if provided
    let categoryId = null;
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return next(ApiError.badRequest('Selected category does not exist.'));
      }
      if (categoryDoc.user && categoryDoc.user.toString() !== req.user._id.toString()) {
        return next(ApiError.forbidden('Cannot create a budget for a category belonging to another user.'));
      }
      categoryId = categoryDoc._id;
    }

    // Check duplicate
    const existing = await Budget.findOne({
      user: req.user._id,
      category: categoryId,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    });

    if (existing) {
      return next(
        ApiError.conflict(
          `A budget for this ${categoryId ? 'category' : 'overall period'} already exists for ${month}/${year}. Edit the existing budget instead.`
        )
      );
    }

    const budget = await Budget.create({
      user: req.user._id,
      category: categoryId,
      amount: parseFloat(amount),
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      alertThreshold: alertThreshold ? parseInt(alertThreshold, 10) : 80,
    });

    const populatedBudget = await Budget.findById(budget._id).populate('category', 'name type icon color');

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: {
        budget: populatedBudget,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update budget by ID
 * PUT /api/budgets/:id
 */
const updateBudget = async (req, res, next) => {
  try {
    const { amount, alertThreshold } = req.body;
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return next(ApiError.notFound('Budget not found'));
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You do not own this budget.'));
    }

    if (amount !== undefined) budget.amount = parseFloat(amount);
    if (alertThreshold !== undefined) budget.alertThreshold = parseInt(alertThreshold, 10);

    await budget.save();

    const updated = await Budget.findById(budget._id).populate('category', 'name type icon color');

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        budget: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete budget by ID
 * DELETE /api/budgets/:id
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return next(ApiError.notFound('Budget not found'));
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Access denied. You do not own this budget.'));
    }

    await Budget.findByIdAndDelete(budget._id);

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
