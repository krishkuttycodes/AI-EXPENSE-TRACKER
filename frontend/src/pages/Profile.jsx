import React, { useState } from 'react';
import { User, ShieldCheck, Save, Check, LogOut, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { formatDate } from '../utils/dateUtils';

export const Profile = () => {
  const { user, updateUser, logout } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await authService.updateProfile(form);
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="transactions-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account & Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Manage your personal settings, currency preferences, and session security
        </p>
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

      {error && (
        <div
          style={{
            backgroundColor: 'var(--expense-red-bg)',
            color: 'var(--expense-red)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Personal Details Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="user-avatar" style={{ width: '3.5rem', height: '3.5rem', fontSize: '1.5rem' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>{user?.name || 'User'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-Only)</label>
              <input
                type="email"
                className="form-control"
                disabled
                value={user?.email || ''}
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Email is permanently bound to your user record in MongoDB Atlas.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="currency">Display Currency</label>
              <select
                id="currency"
                className="form-control"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
                <option value="AED">د.إ UAE Dirham (AED)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ marginTop: '0.5rem' }}
            >
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Security & Authentication Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--income-green)' }} />
            <h3 style={{ fontSize: '1.125rem' }}>Security & Credentials</h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Your account is secured with bcrypt password hashing (10 salt rounds) and stateless JSON Web Tokens. All financial queries, budgets, and AI assistant requests are strictly isolated to your authenticated user identifier in MongoDB Atlas.
          </p>

          <button
            onClick={logout}
            className="btn btn-outline"
            style={{ color: 'var(--expense-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={16} /> Sign Out of Current Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
