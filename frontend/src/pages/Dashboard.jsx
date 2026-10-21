import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  Plus,
  RefreshCw,
} from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import analyticsService from '../services/analyticsService';
import { formatCurrency } from '../utils/currency';
import { getCurrentMonthYear, getMonthOptions, getYearOptions, formatMonthYear } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();
  const current = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(current.month);
  const [selectedYear, setSelectedYear] = useState(current.year);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getDashboard(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve dashboard analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = dashboardData?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savings: 0,
    savingsRate: 0,
    transactionCount: 0,
    prevMonthComparison: { expenseMoMChange: 0 },
  };

  const momChange = summary.prevMonthComparison?.expenseMoMChange || 0;
  const momType = momChange > 0 ? 'negative' : momChange < 0 ? 'positive' : 'neutral';
  const momText = momChange !== 0 ? `${Math.abs(momChange)}% vs last month` : 'Matches last month';

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header Bar */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Financial Dashboard</h1>
          <p>
            Overview for <strong>{formatMonthYear(selectedMonth, selectedYear)}</strong> • Authenticated as {user?.name}
          </p>
        </div>

        <div className="dashboard-controls">
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>

          <button
            onClick={fetchDashboard}
            className="btn btn-outline btn-icon"
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link to="/transactions/new" className="btn btn-primary">
            <Plus size={16} /> Record Transaction
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboard} />}

      {loading && !dashboardData ? (
        <LoadingSpinner text="Computing real-time analytics from MongoDB..." />
      ) : (
        <>
          {/* KPI Summary Grid */}
          <div className="summary-grid">
            <SummaryCard
              title="Total Income"
              amount={formatCurrency(summary.totalIncome)}
              icon={TrendingUp}
              variant="income"
              subtitle={`${summary.transactionCount} transactions this month`}
            />

            <SummaryCard
              title="Total Expenses"
              amount={formatCurrency(summary.totalExpense)}
              icon={TrendingDown}
              variant="expense"
              trend={momText}
              trendType={momType}
            />

            <SummaryCard
              title="Net Balance"
              amount={formatCurrency(summary.balance)}
              icon={Wallet}
              variant={summary.balance >= 0 ? 'primary' : 'expense'}
              subtitle={summary.balance >= 0 ? 'Surplus funds' : 'Deficit spending'}
            />

            <SummaryCard
              title="Savings Rate"
              amount={`${summary.savingsRate}%`}
              icon={PiggyBank}
              variant={summary.savingsRate >= 20 ? 'income' : 'warning'}
              subtitle={
                summary.savingsRate >= 20
                  ? 'Healthy savings goal met'
                  : 'Target standard is > 20%'
              }
            />
          </div>

          {/* Charts Row */}
          <div className="charts-grid">
            <div className="card chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">Income vs Expenses (Last 6 Months)</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Aggregate Trends
                </span>
              </div>
              <div className="chart-card-body">
                <IncomeExpenseChart data={dashboardData?.monthlyTrend || []} />
              </div>
            </div>

            <div className="card chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">Expense Distribution</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  By Category
                </span>
              </div>
              <div className="chart-card-body">
                <CategoryPieChart data={dashboardData?.categoryBreakdown || []} />
              </div>
            </div>
          </div>

          {/* Bottom Grid: Recent Activity & Budgets */}
          <div className="dashboard-bottom-grid">
            <RecentTransactions transactions={dashboardData?.recentTransactions || []} />
            <BudgetProgress budgets={dashboardData?.budgets || []} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
