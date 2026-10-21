const analyticsService = require('../services/analyticsService');
const budgetService = require('../services/budgetService');

/**
 * Get comprehensive analytics dashboard for user
 * GET /api/analytics/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    const [summaryData, budgets] = await Promise.all([
      analyticsService.getDashboardSummary(req.user._id, month, year),
      budgetService.getUserBudgetsWithProgress(req.user._id, month, year),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...summaryData,
        budgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
