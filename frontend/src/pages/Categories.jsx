import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Check, Lock } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import categoryService from '../services/categoryService';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / form state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense',
    color: '#6366f1',
    icon: 'tag',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      type: 'expense',
      color: '#6366f1',
      icon: 'tag',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      type: cat.type,
      color: cat.color || '#6366f1',
      icon: cat.icon || 'tag',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, categoryForm);
        setSuccess('Category updated successfully!');
      } else {
        await categoryService.createCategory(categoryForm);
        setSuccess('Custom category created successfully!');
      }
      setShowModal(false);
      fetchCategories();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.deleteCategory(deleteTarget._id);
      setSuccess('Category deleted successfully');
      setDeleteTarget(null);
      fetchCategories();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete category');
      setDeleteTarget(null);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="transactions-container animate-fade-in">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Categories</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Organize transactions with default templates and custom user categories
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> New Category
        </button>
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

      {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

      {loading ? (
        <LoadingSpinner text="Loading categories..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Expense Categories */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-expense">Expense Categories</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>({expenseCategories.length})</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {expenseCategories.map((cat) => (
                <div key={cat._id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: cat.color || '#6366f1',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{cat.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {cat.isDefault ? 'Default' : 'Custom'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {!cat.isDefault ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="btn btn-outline btn-icon btn-sm"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="btn btn-outline btn-icon btn-sm"
                          style={{ color: 'var(--expense-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span title="Default template category" style={{ color: 'var(--text-muted)' }}>
                        <Lock size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-income">Income Categories</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>({incomeCategories.length})</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {incomeCategories.map((cat) => (
                <div key={cat._id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: cat.color || '#10b981',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{cat.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {cat.isDefault ? 'Default' : 'Custom'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {!cat.isDefault ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="btn btn-outline btn-icon btn-sm"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="btn btn-outline btn-icon btn-sm"
                          style={{ color: 'var(--expense-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span title="Default template category" style={{ color: 'var(--text-muted)' }}>
                        <Lock size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              {editingCategory ? 'Edit Custom Category' : 'Create Custom Category'}
            </h3>

            {formError && (
              <div style={{ color: 'var(--expense-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="catName">Category Name *</label>
                <input
                  id="catName"
                  type="text"
                  placeholder="e.g. Pet Care, Freelance Project"
                  className="form-control"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>

              {!editingCategory && (
                <div className="form-group">
                  <label className="form-label">Category Type *</label>
                  <select
                    className="form-control"
                    value={categoryForm.type}
                    onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="catColor">Category Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    id="catColor"
                    type="color"
                    style={{ width: '3rem', height: '2.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {categoryForm.color}
                  </span>
                </div>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? You cannot delete categories that currently have associated transactions.`}
        confirmText="Delete Category"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Categories;
