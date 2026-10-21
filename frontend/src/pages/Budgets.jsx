import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, PieChart } from 'lucide-react';
import BudgetCard from '../components/budgets/BudgetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import budgetService from '../services/budgetService';
import categoryService from '../services/categoryService';
import { getCurrentMonthYear, getMonthOptions, getYearOptions, formatMonthYear } from '../utils/dateUtils';
import { validateBudget } from '../utils/validation';

export const Budgets = () => {
  const current = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(current.month);
  const [selectedYear, setSelectedYear] = useState(current.year);

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / form state
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState({
    category: '', // empty means overall budget
    amount: '',
    alertThreshold: 80,
    month: current.month,
    year: current.year,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await budgetService.getBudgets(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setBudgets(res.data.budgets || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load budgets');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories('expense');
        if (res.success && res.data) {
          setCategories(res.data.categories || []);
        }
      } catch {
        // Ignored
      }
    };
    fetchCats();
  }, []);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setForm({
      category: '',
      amount: '',
      alertThreshold: 80,
      month: selectedMonth,
      year: selectedYear,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBudget(b);
    setForm({
      category: b.category?._id || '',
      amount: b.amount,
      alertThreshold: b.alertThreshold || 80,
      month: b.month,
      year: b.year,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateBudget(form);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});
    try {
      const payload = {
        amount: parseFloat(form.amount),
        month: parseInt(form.month, 10),
        year: parseInt(form.year, 10),
        category: form.category || null,
        alertThreshold: parseInt(form.alertThreshold, 10) || 80,
      };

      if (editingBudget) {
        await budgetService.updateBudget(editingBudget._id, {
          amount: payload.amount,
          alertThreshold: payload.alertThreshold,
        });
        setSuccess('Budget updated successfully!');
      } else {
        await budgetService.createBudget(payload);
        setSuccess('New budget plan established!');
      }

      setShowModal(false);
      fetchBudgets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setFormErrors({ general: err.message || 'Failed to save budget' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await budgetService.deleteBudget(deleteTarget._id);
      setSuccess('Budget deleted successfully');
      setDeleteTarget(null);
      fetchBudgets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete budget');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Budget Planner</h1>
          <p>
            Spending caps and alerts for <strong>{formatMonthYear(selectedMonth, selectedYear)}</strong>
          </p>
        </div>

        <div className="dashboard-controls">
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Set Budget
          </button>
        </div>
      </div>

      {success && (
        <div
          style={{
            backgroundColor: 'var(--income-green-bg)',
            color: 'var(--income-green)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchBudgets} />}

      {loading ? (
        <LoadingSpinner text="Computing budget limits against recorded transactions..." />
      ) : budgets.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <PieChart size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>No Budgets for This Month</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            Set monthly limits to keep your expenses in check and receive automated threshold alerts.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Create Overall or Category Budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              onEdit={handleOpenEdit}
              onDelete={(target) => setDeleteTarget(target)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              {editingBudget ? 'Update Budget Plan' : 'Create Monthly Budget'}
            </h3>

            {formErrors.general && (
              <div style={{ color: 'var(--expense-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!editingBudget && (
                <div className="form-group">
                  <label className="form-label">Scope</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Overall Monthly Budget (All Expenses)</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="bAmount">Maximum Limit Amount (₹) *</label>
                <input
                  id="bAmount"
                  type="number"
                  step="1"
                  placeholder="e.g. 25000"
                  className="form-control"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                {formErrors.amount && <div className="form-error">{formErrors.amount}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bThreshold">Alert Warning Threshold (% of limit)</label>
                <input
                  id="bThreshold"
                  type="number"
                  min="10"
                  max="100"
                  placeholder="80"
                  className="form-control"
                  value={form.alertThreshold}
                  onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  You will receive a warning status when spending reaches this percentage.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Establish Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Budget"
        message={`Are you sure you want to remove this budget of ₹${deleteTarget?.amount}? Transactions will not be affected.`}
        confirmText="Delete Budget"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Budgets;
