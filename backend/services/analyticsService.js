const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

class AnalyticsService {
  /**
   * Get Dashboard Summary Statistics for a user and month/year
   */
  async getDashboardSummary(userId, month, year) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    // Previous month range for month-over-month comparison
    const prevStartDate = new Date(Date.UTC(targetMonth === 1 ? targetYear - 1 : targetYear, targetMonth === 1 ? 11 : targetMonth - 2, 1));
    const prevEndDate = new Date(Date.UTC(targetMonth === 1 ? targetYear - 1 : targetYear, targetMonth === 1 ? 11 : targetMonth - 1, 0, 23, 59, 59, 999));

    // 1. Current Month Totals
    const currentAgg = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = 0;

    currentAgg.forEach((item) => {
      transactionCount += item.count;
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpense = item.total;
    });

    const netBalance = totalIncome - totalExpense;
    const savings = Math.max(0, netBalance);
    // Safe savings rate calculation
    const savingsRate = totalIncome > 0 ? Number(((savings / totalIncome) * 100).toFixed(1)) : 0;

    // 2. Previous Month Totals for comparison
    const prevAgg = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: prevStartDate, $lte: prevEndDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let prevIncome = 0;
    let prevExpense = 0;
    prevAgg.forEach((item) => {
      if (item._id === 'income') prevIncome = item.total;
      if (item._id === 'expense') prevExpense = item.total;
    });

    const expenseMoMChange = prevExpense > 0
      ? Number((((totalExpense - prevExpense) / prevExpense) * 100).toFixed(1))
      : 0;

    // 3. Category Breakdown for Pie Chart
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
    ]);

    const categoryBreakdown = categoryAgg.map((c) => ({
      categoryId: c._id,
      name: c.categoryDetails ? c.categoryDetails.name : 'Uncategorized',
      color: c.categoryDetails?.color || '#818cf8',
      icon: c.categoryDetails?.icon || 'tag',
      total: Number(c.total.toFixed(2)),
      percentage: totalExpense > 0 ? Number(((c.total / totalExpense) * 100).toFixed(1)) : 0,
      count: c.count,
    }));

    // 4. Monthly 6-Month Income vs Expense Trend
    const sixMonthsAgo = new Date(Date.UTC(targetYear, targetMonth - 6, 1));
    const trendAgg = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          date: { $gte: sixMonthsAgo, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build timeline for last 6 months
    const monthlyTrendMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(targetYear, targetMonth - 1 - i, 1));
      const m = d.getUTCMonth() + 1;
      const y = d.getUTCFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const key = `${monthNames[m - 1]} ${y}`;
      monthlyTrendMap[`${y}-${m}`] = {
        label: key,
        month: m,
        year: y,
        income: 0,
        expense: 0,
        net: 0,
      };
    }

    trendAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthlyTrendMap[key]) {
        if (item._id.type === 'income') monthlyTrendMap[key].income = Number(item.total.toFixed(2));
        if (item._id.type === 'expense') monthlyTrendMap[key].expense = Number(item.total.toFixed(2));
        monthlyTrendMap[key].net = Number((monthlyTrendMap[key].income - monthlyTrendMap[key].expense).toFixed(2));
      }
    });

    const monthlyTrend = Object.values(monthlyTrendMap);

    // 5. Daily Spending for Current Month
    const dailyAgg = await Transaction.aggregate([
      {
        $match: {
          user: userObjectId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const dailySpending = [];
    const dailyMap = {};
    dailyAgg.forEach((d) => { dailyMap[d._id] = d.amount; });

    for (let day = 1; day <= daysInMonth; day++) {
      dailySpending.push({
        day,
        amount: Number((dailyMap[day] || 0).toFixed(2)),
      });
    }

    // 6. Recent 5 Transactions
    const recentTransactions = await Transaction.find({ user: userObjectId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate('category', 'name type icon color');

    return {
      period: {
        month: targetMonth,
        year: targetYear,
      },
      summary: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        balance: Number(netBalance.toFixed(2)),
        savings: Number(savings.toFixed(2)),
        savingsRate,
        transactionCount,
        prevMonthComparison: {
          prevIncome: Number(prevIncome.toFixed(2)),
          prevExpense: Number(prevExpense.toFixed(2)),
          expenseMoMChange,
        },
      },
      categoryBreakdown,
      monthlyTrend,
      dailySpending,
      recentTransactions,
    };
  }
}

module.exports = new AnalyticsService();
