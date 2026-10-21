import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/currency';

const COLOR_PALETTE = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
  '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#64748b'
];

export const CategoryPieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        No expense transactions recorded in this period.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 320, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name) => [formatCurrency(value), name]}
              contentStyle={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLOR_PALETTE[index % COLOR_PALETTE.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list below */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
          marginTop: '0.5rem',
          maxHeight: '80px',
          overflowY: 'auto',
          fontSize: '0.75rem',
        }}
      >
        {data.slice(0, 6).map((item, index) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: item.color || COLOR_PALETTE[index % COLOR_PALETTE.length],
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
            <span style={{ fontWeight: 600 }}>({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
