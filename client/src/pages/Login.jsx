import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Pill,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    location.search.includes('expired=true')
      ? 'Your session has expired. Please log in again.'
      : ''
  );

  const redirectPath = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(formData.email, formData.password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        background: 'radial-gradient(ellipse at top, #0f172a 0%, #0a0e17 100%)'
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card, rgba(17, 24, 39, 0.75))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(0, 0, 0, 0.45)), 0 0 25px rgba(6, 182, 212, 0.15)',
          zIndex: 1,
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '16px',
              background: 'var(--grad-cyan-blue, linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Pill size={28} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px'
            }}
          >
            DoseFlow
          </h1>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
            Hospital Medicine Inventory Intelligence
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.875rem',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-secondary, #94a3b8)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)'
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@doseflow.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--cyan-primary, #06b6d4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.08))';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-secondary, #94a3b8)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--cyan-primary, #06b6d4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.08))';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #64748b)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '13px',
              borderRadius: '10px',
              background: 'var(--grad-cyan-blue, linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%))',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
              transition: 'transform 0.15s, opacity 0.15s',
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick-Fill Demo Credentials */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted, #64748b)',
              marginBottom: '10px',
              textAlign: 'center'
            }}
          >
            Instant Demo Sign-In
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@doseflow.com', 'Admin@123')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: 'var(--cyan-primary, #06b6d4)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={14} />
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff@doseflow.com', 'Staff@123')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: 'var(--blue-primary, #3b82f6)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserCheck size={14} />
              Staff Demo
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <p
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #94a3b8)'
          }}
        >
          Need a new staff account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--cyan-primary, #06b6d4)',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
