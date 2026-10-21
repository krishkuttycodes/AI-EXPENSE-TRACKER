import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Bell } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const { user } = useAuth();

  return (
    <header className="app-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-outline btn-icon"
          aria-label="Toggle Navigation Menu"
          style={{ display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Currency: <strong style={{ color: 'var(--primary-600)' }}>₹ {user?.currency || 'INR'}</strong>
        </span>
      </div>

      <div className="navbar-actions">
        <Link to="/transactions/new" className="btn btn-sm btn-primary">
          <Plus size={16} /> Add Transaction
        </Link>

        <button
          onClick={toggleTheme}
          className="btn btn-outline btn-icon"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="user-avatar" style={{ width: '2rem', height: '2rem', fontSize: '0.8125rem' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
