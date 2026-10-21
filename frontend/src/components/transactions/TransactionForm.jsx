import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Save, X, Repeat } from 'lucide-react';
import { validateTransaction } from '../../utils/validation';
import { toInputDateFormat } from '../../utils/dateUtils';

export const TransactionForm = ({
  initialValues = {},
  categories = [],
  onSubmit,
  loading = false,
  isEdit = false,
}) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: initialValues.type || 'expense',
    amount: initialValues.amount !== undefined ? initialValues.amount : '',
    category: initialValues.category?._id || initialValues.category || '',
    date: toInputDateFormat(initialValues.date),
    note: initialValues.note || '',
    isRecurring: Boolean(initialValues.isRecurring),
    recurringFrequency: initialValues.recurringFrequency || 'none',
  });

  const [errors, setErrors] = useState({});

  // When type changes, if current category is not for this type, auto-select first matching category
  const filteredCategories = categories.filter((c) => c.type === form.type);

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some((c) => c._id === form.category)) {
      setForm((prev) => ({ ...prev, category: filteredCategories[0]._id }));
    }
  }, [form.type, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateTransaction(form);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="type-toggle-group">
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`type-toggle-btn ${form.type === 'income' ? 'active-income' : ''}`}
        >
          <ArrowDownLeft size={18} /> Income
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`type-toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
        >
          <ArrowUpRight size={18} /> Expense
        </button>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="amount">
          Amount (₹ INR) *
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="e.g. 5000"
          className="form-control"
          value={form.amount}
          onChange={handleChange}
        />
        {errors.amount && <div className="form-error">{errors.amount}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">
          Category *
        </label>
        <select
          id="category"
          name="category"
          className="form-control"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">Select a Category</option>
          {filteredCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <div className="form-error">{errors.category}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">
          Date *
        </label>
        <input
          id="date"
          name="date"
          type="date"
          className="form-control"
          value={form.date}
          onChange={handleChange}
        />
        {errors.date && <div className="form-error">{errors.date}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="note">
          Note / Description
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="e.g. Client payment, weekly groceries..."
          className="form-control"
          value={form.note}
          onChange={handleChange}
        />
        {errors.note && <div className="form-error">{errors.note}</div>}
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            name="isRecurring"
            checked={form.isRecurring}
            onChange={handleChange}
          />
          <Repeat size={16} /> Recurring Transaction
        </label>

        {form.isRecurring && (
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label" htmlFor="recurringFrequency">
              Frequency
            </label>
            <select
              id="recurringFrequency"
              name="recurringFrequency"
              className="form-control"
              value={form.recurringFrequency}
              onChange={handleChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => navigate('/transactions')}
          className="btn btn-secondary"
        >
          <X size={16} /> Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          <Save size={16} /> {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Record Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
