import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/transactions/TransactionForm';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import categoryService from '../services/categoryService';
import transactionService from '../services/transactionService';

export const AddTransaction = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        setError(err.message || 'Unable to load categories');
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      await transactionService.createTransaction(formData);
      navigate('/transactions');
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
      setSaving(false);
    }
  };

  return (
    <div className="transactions-container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Record Transaction</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Add income or expense to persist permanently in MongoDB Atlas
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {loadingCats ? (
        <LoadingSpinner text="Fetching categories..." />
      ) : (
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          loading={saving}
          isEdit={false}
        />
      )}
    </div>
  );
};

export default AddTransaction;
