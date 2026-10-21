import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={{
      backgroundColor: 'var(--expense-red-bg)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      margin: '1rem 0',
      color: 'var(--expense-red)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <AlertCircle size={20} />
        <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
          {message || 'An unexpected error occurred.'}
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-outline"
          style={{ borderColor: 'var(--expense-red)', color: 'var(--expense-red)' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
