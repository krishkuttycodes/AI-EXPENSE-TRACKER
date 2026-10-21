import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import TransactionItem from './TransactionItem';
import LoadingSpinner from '../common/LoadingSpinner';

export const TransactionTable = ({
  transactions = [],
  pagination = {},
  loading = false,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="table-card">
        <LoadingSpinner text="Loading transactions from MongoDB Atlas..." />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="table-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <Inbox size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>No Transactions Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '400px', margin: '0 auto' }}>
          No records match your filter criteria or you haven't recorded transactions yet.
        </p>
      </div>
    );
  }

  const { page = 1, pages = 1, total = 0, limit = 10 } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Note</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <TransactionItem
                key={tx._id}
                transaction={tx}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{total}</strong> records
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="btn btn-outline btn-sm btn-icon"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem' }}>
              Page {page} of {pages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="btn btn-outline btn-sm btn-icon"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
