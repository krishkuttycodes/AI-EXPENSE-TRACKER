const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

/**
 * Service to calculate budget performance, remaining amounts, and alert states
 */
class BudgetService {
  /**
   * Get user budgets for a specific month and year with real calculated spending
   */
  async getUserBudgetsWithProgress(userId, month, year) {
    const targetMonth = parseInt(month, 10);
    const targetYear = parseInt(year, 10);

    // Date range for the target month
    const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    // Fetch all budgets defined for this month/year
    const budgets = await Budget.find({
      user: userId,
      month: targetMonth,
      year: targetYear,
    }).populate('category', 'name type icon color');

    // Aggregate user expenses in this month by category
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    // Map spent by category id string
    const spentByCategory = {};
    let totalOverallExpense = 0;

    expenseAgg.forEach((item) => {
      const catId = item._id ? item._id.toString() : 'uncategorized';
      spentByCategory[catId] = item.totalSpent;
      totalOverallExpense += item.totalSpent;
    });

    // Compute progress for each budget
    return budgets.map((b) => {
      const budgetObj = b.toObject();
      const isOverall = !b.category;
      const spent = isOverall
        ? totalOverallExpense
        : (spentByCategory[b.category._id.toString()] || 0);

      const limit = budgetObj.amount;
      const remaining = Math.max(0, limit - spent);
      const percentageUsed = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
      const isExceeded = spent > limit;
      const isWarning = !isExceeded && percentageUsed >= (budgetObj.alertThreshold || 80);

      return {
        ...budgetObj,
        spent: Number(spent.toFixed(2)),
        remaining: Number(remaining.toFixed(2)),
        percentageUsed,
        isWarning,
        isExceeded,
        status: isExceeded ? 'exceeded' : isWarning ? 'warning' : 'healthy',
      };
    });
  }
}

module.exports = new BudgetService();
