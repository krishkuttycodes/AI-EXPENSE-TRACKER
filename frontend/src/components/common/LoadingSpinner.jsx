import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 28, text = 'Loading data...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      gap: '0.75rem',
      color: 'var(--text-muted)'
    }}>
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
      {text && <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
