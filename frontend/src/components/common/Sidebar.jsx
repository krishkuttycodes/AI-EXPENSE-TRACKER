import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Tag,
  PieChart,
  BarChart3,
  Sparkles,
  User,
  LogOut,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/transactions/new', label: 'Add Transaction', icon: PlusCircle },
    { to: '/categories', label: 'Categories', icon: Tag },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/ai-insights', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="sidebar-brand-icon">
              <Wallet size={20} />
            </div>
            <span className="sidebar-brand-name">FinAI Tracker</span>
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              className="btn btn-outline btn-icon btn-sm"
              style={{ display: 'flex' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      padding: '0.125rem 0.375rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                      color: '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge" style={{ marginBottom: '0.75rem' }}>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--expense-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
