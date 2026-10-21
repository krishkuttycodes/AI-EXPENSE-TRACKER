import { useState, useEffect, useCallback } from 'react';
import transactionService from '../services/transactionService';

export const useTransactions = (initialFilters = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionService.getTransactions(filters);
      if (res.success && res.data) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0, limit: 10 });
        setSummary(res.data.summary || { income: 0, expense: 0, balance: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  return {
    transactions,
    pagination,
    summary,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refresh: fetchTransactions,
  };
};

export default useTransactions;
