import React from 'react';
import { Edit2, Trash2, AlertCircle, CheckCircle, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const isOverall = !budget.category;
  const name = isOverall ? 'Overall Monthly Budget' : budget.category.name;
  const percent = Math.min(100, budget.percentageUsed);

  let barColor = 'var(--income-green)';
  let statusBadge = (
    <span className="badge badge-income">
      <CheckCircle size={12} /> On Track
    </span>
  );

  if (budget.isExceeded) {
    barColor = 'var(--expense-red)';
    statusBadge = (
      <span className="badge badge-expense">
        <AlertCircle size={12} /> Exceeded
      </span>
    );
  } else if (budget.isWarning) {
    barColor = 'var(--warning-amber)';
    statusBadge = (
      <span className="badge badge-warning">
        <AlertCircle size={12} /> Nearing Limit ({budget.alertThreshold}%)
      </span>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isOverall ? 'var(--primary-100)' : 'var(--bg-subtle)',
              color: isOverall ? 'var(--primary-600)' : budget.category?.color || 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PieChart size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Alert at {budget.alertThreshold || 80}%
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => onEdit(budget)}
            className="btn btn-outline btn-icon btn-sm"
            title="Edit Budget"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="btn btn-outline btn-icon btn-sm"
            style={{ color: 'var(--expense-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            title="Delete Budget"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Spent: <strong>{formatCurrency(budget.spent)}</strong></span>
          <span style={{ color: 'var(--text-secondary)' }}>Limit: <strong>{formatCurrency(budget.amount)}</strong></span>
        </div>

        <div className="progress-bar-bg" style={{ height: '0.65rem' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${percent}%`,
              backgroundColor: barColor,
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {budget.percentageUsed}% used
          </span>
          {statusBadge}
        </div>
      </div>

      <div
        style={{
          padding: '0.625rem 0.75rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>Remaining Allowance:</span>
        <strong style={{ color: budget.isExceeded ? 'var(--expense-red)' : 'var(--income-green)' }}>
          {formatCurrency(budget.remaining)}
        </strong>
      </div>
    </div>
  );
};

export default BudgetCard;
