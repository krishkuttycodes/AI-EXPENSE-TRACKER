import React from 'react';
import { Search, Download, RotateCcw, Filter } from 'lucide-react';
import { getMonthOptions, getYearOptions } from '../../utils/dateUtils';

export const TransactionFilters = ({
  filters,
  categories = [],
  onFilterChange,
  onReset,
  onExportCSV,
  exporting = false,
}) => {
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  return (
    <div className="filters-bar">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by note or description..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>

      <select
        className="form-control filter-select"
        value={filters.type || ''}
        onChange={(e) => onFilterChange({ type: e.target.value })}
      >
        <option value="">All Types</option>
        <option value="income">Income Only</option>
        <option value="expense">Expense Only</option>
      </select>

      <select
        className="form-control filter-select"
        value={filters.category || ''}
        onChange={(e) => onFilterChange({ category: e.target.value })}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name} ({cat.type})
          </option>
        ))}
      </select>

      <select
        className="form-control filter-select"
        value={filters.month || ''}
        onChange={(e) => onFilterChange({ month: e.target.value })}
      >
        <option value="">All Months</option>
        {monthOptions.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        className="form-control filter-select"
        value={filters.year || ''}
        onChange={(e) => onFilterChange({ year: e.target.value })}
      >
        <option value="">All Years</option>
        {yearOptions.map((y) => (
          <option key={y.value} value={y.value}>
            {y.label}
          </option>
        ))}
      </select>

      <select
        className="form-control filter-select"
        value={`${filters.sortBy || 'date'}_${filters.sortOrder || 'desc'}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split('_');
          onFilterChange({ sortBy, sortOrder });
        }}
      >
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="amount_desc">Highest Amount</option>
        <option value="amount_asc">Lowest Amount</option>
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
        <button
          onClick={onReset}
          className="btn btn-outline btn-sm"
          title="Reset all filters"
        >
          <RotateCcw size={14} /> Reset
        </button>

        <button
          onClick={onExportCSV}
          className="btn btn-secondary btn-sm"
          disabled={exporting}
          title="Export filtered records to CSV"
        >
          <Download size={14} /> {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>
    </div>
  );
};

export default TransactionFilters;
