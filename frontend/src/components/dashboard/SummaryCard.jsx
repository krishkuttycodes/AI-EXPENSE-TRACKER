import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const SummaryCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'primary', // 'income', 'expense', 'primary', 'warning', 'info'
  trend,
  trendType = 'neutral', // 'positive', 'negative', 'neutral'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return {
          bg: 'var(--income-green-bg)',
          color: 'var(--income-green)',
        };
      case 'expense':
        return {
          bg: 'var(--expense-red-bg)',
          color: 'var(--expense-red)',
        };
      case 'warning':
        return {
          bg: 'var(--warning-amber-bg)',
          color: 'var(--warning-amber)',
        };
      case 'info':
        return {
          bg: 'var(--info-cyan-bg)',
          color: 'var(--info-cyan)',
        };
      default:
        return {
          bg: 'var(--primary-100)',
          color: 'var(--primary-600)',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="summary-card">
      <div className="summary-card-top">
        <span className="summary-card-title">{title}</span>
        {Icon && (
          <div
            className="summary-card-icon"
            style={{ backgroundColor: styles.bg, color: styles.color }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="summary-card-amount">{amount}</div>

      {(subtitle || trend) && (
        <div className="summary-card-trend">
          {trend !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontWeight: 600,
                color:
                  trendType === 'positive'
                    ? 'var(--income-green)'
                    : trendType === 'negative'
                    ? 'var(--expense-red)'
                    : 'var(--text-muted)',
              }}
            >
              {trendType === 'positive' && <TrendingUp size={14} />}
              {trendType === 'negative' && <TrendingDown size={14} />}
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
