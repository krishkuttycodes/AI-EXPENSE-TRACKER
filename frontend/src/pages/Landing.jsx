import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Bot,
  ArrowRight,
  Wallet,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="auth-page" style={{ flexDirection: 'column', padding: 0 }}>
      {/* Top Navbar */}
      <header
        style={{
          width: '100%',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="sidebar-brand-icon">
            <Wallet size={20} />
          </div>
          <span className="sidebar-brand-name">FinAI Tracker</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero animate-fade-in">
        <div className="landing-badge">
          <Sparkles size={16} /> Intelligent Full-Stack Financial Engineering
        </div>

        <h1 className="landing-title">
          Master Your Wealth with Next-Gen AI Financial Intelligence
        </h1>

        <p className="landing-desc">
          A production-grade MERN stack expense tracker designed for modern finances. Track income, monitor category budgets, discover spending trends, and chat with your AI finance assistant in real time.
        </p>

        <div className="landing-actions">
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1.0625rem' }}>
            {isAuthenticated ? 'Open Dashboard' : 'Start Free Today'} <ArrowRight size={18} />
          </Link>
          <a href="#features" className="btn btn-outline" style={{ padding: '0.875rem 1.75rem', fontSize: '1.0625rem' }}>
            Explore Architecture
          </a>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" style={{ width: '100%' }}>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Finance Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              An interactive conversational assistant powered by Google Gemini. Ask questions about your spending, compare monthly records, and receive realistic budgeting advice.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Precision Analytics</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Interactive Recharts data visualisations. Six-month income vs expense trends, category distribution donuts, and daily spending velocity calculated accurately from MongoDB.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <PieChart size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Smart Budget Planning</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Configure overall monthly and category-specific expense limits. Receive proactive warnings when spending crosses 80% and instant alerts when limits are exceeded.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Complete Data Isolation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Rock-solid security with JWT authentication, bcrypt password hashing, input sanitization, ownership verification, and zero credential exposure.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ width: '100%', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        FinAI Tracker • Full-Stack MERN Architecture with Express, MongoDB Atlas, Recharts & Google Gemini.
      </footer>
    </div>
  );
};

export default Landing;
