import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionForm from '../components/transactions/TransactionForm';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import categoryService from '../services/categoryService';
import transactionService from '../services/transactionService';

export const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txRes, catRes] = await Promise.all([
          transactionService.getTransaction(id),
          categoryService.getCategories(),
        ]);

        if (txRes.success && txRes.data?.transaction) {
          setTransaction(txRes.data.transaction);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load transaction data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      await transactionService.updateTransaction(id, formData);
      navigate('/transactions');
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
      setSaving(false);
    }
  };

  return (
    <div className="transactions-container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Edit Transaction</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Modify your recorded financial entry
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Retrieving transaction details..." />
      ) : transaction ? (
        <TransactionForm
          initialValues={transaction}
          categories={categories}
          onSubmit={handleSubmit}
          loading={saving}
          isEdit={true}
        />
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Transaction record could not be found.
        </div>
      )}
    </div>
  );
};

export default EditTransaction;
