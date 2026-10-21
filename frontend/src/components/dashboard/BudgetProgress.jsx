import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export const BudgetProgress = ({ budgets = [] }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <h3 style={{ fontSize: '1.125rem' }}>Budget Limits</h3>
        <Link
          to="/budgets"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          Manage <ArrowRight size={14} />
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 1rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          <p>No budgets configured for this month.</p>
          <Link to="/budgets" className="btn btn-sm btn-secondary" style={{ marginTop: '0.75rem' }}>
            Set Monthly Budget
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {budgets.slice(0, 4).map((b) => {
            const name = b.category ? b.category.name : 'Overall Monthly Budget';
            const percent = Math.min(100, b.percentageUsed);

            let barColor = 'var(--income-green)';
            if (b.isExceeded) {
              barColor = 'var(--expense-red)';
            } else if (b.isWarning) {
              barColor = 'var(--warning-amber)';
            }

            return (
              <div key={b._id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                  </span>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{b.percentageUsed}% used</span>
                  {b.isExceeded ? (
                    <span className="badge badge-expense" style={{ padding: '0.125rem 0.375rem' }}>
                      <AlertCircle size={10} /> Exceeded
                    </span>
                  ) : b.isWarning ? (
                    <span className="badge badge-warning" style={{ padding: '0.125rem 0.375rem' }}>
                      <AlertCircle size={10} /> Limit Near
                    </span>
                  ) : (
                    <span className="badge badge-income" style={{ padding: '0.125rem 0.375rem' }}>
                      <CheckCircle size={10} /> On Track
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
