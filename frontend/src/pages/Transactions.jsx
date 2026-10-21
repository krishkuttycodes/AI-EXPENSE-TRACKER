import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';
import useTransactions from '../hooks/useTransactions';
import categoryService from '../services/categoryService';
import transactionService from '../services/transactionService';

export const Transactions = () => {
  const navigate = useNavigate();
  const {
    transactions,
    pagination,
    summary,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refresh,
  } = useTransactions();

  const [categories, setCategories] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data.categories || []);
        }
      } catch {
        // Handled silently
      }
    };
    loadCategories();
  }, []);

  const handleEdit = (tx) => {
    navigate(`/transactions/edit/${tx._id}`);
  };

  const handleDeletePrompt = (tx) => {
    setDeleteTarget(tx);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transactionService.deleteTransaction(deleteTarget._id);
      setSuccessNotice('Transaction deleted successfully.');
      setDeleteTarget(null);
      refresh();
      setTimeout(() => setSuccessNotice(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete transaction');
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await transactionService.downloadCSV(filters);
    } catch (err) {
      alert(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="transactions-container animate-fade-in">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Manage, filter, search, and export your complete financial history
          </p>
        </div>

        <button
          onClick={() => navigate('/transactions/new')}
          className="btn btn-primary"
        >
          <Plus size={16} /> New Transaction
        </button>
      </div>

      {successNotice && (
        <div
          style={{
            backgroundColor: 'var(--income-green-bg)',
            color: 'var(--income-green)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Check size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={refresh} />}

      <TransactionFilters
        filters={filters}
        categories={categories}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        onExportCSV={handleExportCSV}
        exporting={exporting}
      />

      <TransactionTable
        transactions={transactions}
        pagination={pagination}
        loading={loading}
        onPageChange={(page) => updateFilters({ page })}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${deleteTarget?.type} of ₹${deleteTarget?.amount}? This action cannot be undone.`}
        confirmText="Confirm Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Transactions;
