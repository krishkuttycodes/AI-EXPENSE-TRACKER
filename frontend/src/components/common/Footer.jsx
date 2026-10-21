import React from 'react';

export const Footer = () => {
  return (
    <footer style={{
      padding: '1.5rem',
      textAlign: 'center',
      fontSize: '0.8125rem',
      color: 'var(--text-muted)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 'auto',
    }}>
      <p>© {new Date().getFullYear()} FinAI Tracker — Production-grade Full-Stack MERN Expense Tracker with AI Insights.</p>
    </footer>
  );
};

export default Footer;
