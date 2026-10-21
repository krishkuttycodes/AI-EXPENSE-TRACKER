import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
  Lightbulb,
  Settings,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import aiService from '../services/aiService';
import { formatCurrency } from '../utils/currency';
import { getCurrentMonthYear, getMonthOptions, getYearOptions, formatMonthYear } from '../utils/dateUtils';

export const AIInsights = () => {
  const current = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(current.month);
  const [selectedYear, setSelectedYear] = useState(current.year);

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiService.getInsights(selectedMonth, selectedYear);
      if (res.success && res.data?.insights) {
        setInsights(res.data.insights);
      }
    } catch (err) {
      setError(err.message || 'Unable to generate financial insights');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const metrics = insights?.metrics || {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,
    expenseMoMChange: 0,
  };

  const recommendations = insights?.recommendations || [];
  const topCategories = insights?.topCategories || [];
  const budgetAlerts = insights?.budgetAlerts || [];
  const isAIConfigured = insights?.configured;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1>AI Financial Intelligence</h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-full)',
                background: isAIConfigured
                  ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                  : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                color: '#ffffff',
              }}
            >
              {isAIConfigured ? 'LLM ACTIVE' : 'RULE-BASED MODE'}
            </span>
          </div>
          <p>
            Automated spending audit and savings opportunities for <strong>{formatMonthYear(selectedMonth, selectedYear)}</strong>
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
            onClick={fetchInsights}
            className="btn btn-outline btn-icon"
            title="Refresh Insights"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInsights} />}

      {/* AI Key Notice when unconfigured */}
      {!isAIConfigured && !loading && (
        <div
          className="card"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            marginBottom: '1.5rem',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <Settings size={22} style={{ color: 'var(--warning-amber)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--warning-amber)', marginBottom: '0.25rem' }}>
                AI Model Key Not Configured in Backend
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Deterministic mathematical analytics and rule-based insights are fully functioning below. To enable dynamic generative LLM reviews and real-time chat with Google Gemini:
              </p>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                1. Open <code style={{ backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>backend/.env</code><br />
                2. Set <code style={{ backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>AI_API_KEY=your_gemini_api_key</code> (free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Google AI Studio</a>)<br />
                3. Restart backend with <code style={{ backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>npm run dev</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !insights ? (
        <LoadingSpinner text="Analyzing your financial records..." />
      ) : (
        <>
          {/* Executive AI Commentary if available */}
          {insights?.aiAnalysis && (
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
                borderColor: 'var(--primary-300)',
                marginBottom: '1.75rem',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>Executive Financial Commentary</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Synthesized from your authenticated {formatMonthYear(selectedMonth, selectedYear)} transactions
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.9375rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {insights.aiAnalysis}
              </div>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="summary-grid" style={{ marginBottom: '1.75rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>CASH SURPLUS</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>
                {formatCurrency(metrics.balance)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Income minus total outflow
              </span>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>SAVINGS EFFICIENCY</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0', color: metrics.savingsRate >= 20 ? 'var(--income-green)' : 'var(--warning-amber)' }}>
                {metrics.savingsRate}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Goal: ≥ 20% of net income
              </span>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>MOM EXPENSE SHIFT</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0', color: metrics.expenseMoMChange > 0 ? 'var(--expense-red)' : 'var(--income-green)' }}>
                {metrics.expenseMoMChange > 0 ? `+${metrics.expenseMoMChange}%` : `${metrics.expenseMoMChange}%`}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Compared to preceding month
              </span>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Lightbulb size={20} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.125rem' }}>Strategic Opportunities</h3>
              </div>

              {recommendations.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No anomalies or urgent alerts detected for this month.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-subtle)',
                        borderLeft: `4px solid ${
                          rec.type === 'warning'
                            ? 'var(--expense-red)'
                            : rec.type === 'success'
                            ? 'var(--income-green)'
                            : 'var(--info-cyan)'
                        }`,
                      }}
                    >
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {rec.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget & Concentration Alerts */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <AlertTriangle size={20} style={{ color: 'var(--warning-amber)' }} />
                <h3 style={{ fontSize: '1.125rem' }}>Budget Limit Alerts</h3>
              </div>

              {budgetAlerts.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--income-green)', padding: '1rem 0' }}>
                  <CheckCircle size={20} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>All established budgets are within healthy limits!</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {budgetAlerts.map((b) => (
                    <div
                      key={b._id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: b.isExceeded ? 'var(--expense-red-bg)' : 'var(--warning-amber-bg)',
                        color: b.isExceeded ? 'var(--expense-red)' : 'var(--warning-amber)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {b.category ? b.category.name : 'Overall Budget'}: {b.percentageUsed}% Used
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Spent {formatCurrency(b.spent)} of {formatCurrency(b.amount)} limit
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Highest Spending Categories */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Top Expense Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {topCategories.map((cat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.total)} ({cat.percentage}%)</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIInsights;
