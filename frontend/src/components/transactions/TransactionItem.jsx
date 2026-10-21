import React from 'react';
import { Edit2, Trash2, Tag, Calendar, Repeat } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

export const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income';

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{formatDate(transaction.date)}</span>
        </div>
      </td>
      <td>
        <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
          {isIncome ? 'Income' : 'Expense'}
        </span>
      </td>
      <td>
        <div className="category-cell">
          <div
            className="category-icon-badge"
            style={{
              backgroundColor: transaction.category?.color || '#6366f1',
            }}
          >
            <Tag size={12} />
          </div>
          <span style={{ fontWeight: 600 }}>{transaction.category?.name || 'Uncategorized'}</span>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>{transaction.note || '—'}</span>
          {transaction.isRecurring && (
            <span
              title={`Recurring: ${transaction.recurringFrequency}`}
              style={{ color: 'var(--primary-500)', display: 'inline-flex' }}
            >
              <Repeat size={14} />
            </span>
          )}
        </div>
      </td>
      <td>
        <span className={isIncome ? 'amount-income' : 'amount-expense'}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
      </td>
      <td>
        <div className="table-actions">
          <button
            onClick={() => onEdit(transaction)}
            className="btn btn-outline btn-icon btn-sm"
            title="Edit Transaction"
            aria-label="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="btn btn-outline btn-icon btn-sm"
            style={{ color: 'var(--expense-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            title="Delete Transaction"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TransactionItem;
