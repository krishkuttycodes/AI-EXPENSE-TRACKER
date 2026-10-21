import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ArrowRight, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

export const RecentTransactions = ({ transactions = [] }) => {
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
        <h3 style={{ fontSize: '1.125rem' }}>Recent Transactions</h3>
        <Link
          to="/transactions"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {transactions.length === 0 ? (
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
          <Tag size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>No recent transactions recorded yet.</p>
          <Link to="/transactions/new" className="btn btn-sm btn-primary" style={{ marginTop: '0.75rem' }}>
            Add First Transaction
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isIncome ? 'var(--income-green-bg)' : 'var(--expense-red-bg)',
                      color: isIncome ? 'var(--income-green)' : 'var(--expense-red)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {tx.category?.name || 'Uncategorized'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.note || formatDate(tx.date)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    className={isIncome ? 'amount-income' : 'amount-expense'}
                    style={{ fontSize: '0.9375rem' }}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {formatDate(tx.date)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
