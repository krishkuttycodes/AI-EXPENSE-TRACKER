import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import analyticsService from '../services/analyticsService';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import { getCurrentMonthYear, getMonthOptions, getYearOptions, formatMonthYear } from '../utils/dateUtils';

const CustomDailyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.8125rem',
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Day {label}</p>
        <p style={{ color: 'var(--expense-red)', fontWeight: 600 }}>
          Expense: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const Analytics = () => {
  const current = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(current.month);
  const [selectedYear, setSelectedYear] = useState(current.year);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyticsService.getDashboard(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = data?.summary || { totalIncome: 0, totalExpense: 0, balance: 0, savingsRate: 0 };
  const categories = data?.categoryBreakdown || [];
  const dailySpending = data?.dailySpending || [];

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Financial Analytics</h1>
          <p>
            Detailed cash flow breakdowns and velocity for <strong>{formatMonthYear(selectedMonth, selectedYear)}</strong>
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
            onClick={fetchAnalytics}
            className="btn btn-outline btn-icon"
            title="Refresh Analytics"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

      {loading && !data ? (
        <LoadingSpinner text="Crunching financial analytics..." />
      ) : (
        <>
          {/* Daily Expense Velocity Area Chart */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem' }}>Daily Spending Velocity</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Track expense spikes throughout {formatMonthYear(selectedMonth, selectedYear)}
                </p>
              </div>
            </div>

            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySpending} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => formatCompactCurrency(val)}
                  />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
              Category Spending Matrix
            </h3>

            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No category expense data recorded for this month.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Total Outflow</th>
                      <th>Share of Expenses</th>
                      <th>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.categoryId || cat.name}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: cat.color || '#6366f1',
                              }}
                            />
                            <strong>{cat.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="amount-expense">{formatCurrency(cat.total)}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="progress-bar-bg" style={{ width: 100, margin: 0 }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${cat.percentage}%`,
                                  backgroundColor: cat.color || '#6366f1',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{cat.percentage}%</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>{cat.count} entry/entries</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
