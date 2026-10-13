import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main, #0b0f19)',
          color: 'var(--text-main, #f8fafc)',
          gap: '16px'
        }}
      >
        <Loader2 size={36} className="animate-spin text-primary" style={{ color: 'var(--primary, #3b82f6)' }} />
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem' }}>
          Verifying security session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '32px'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: '#ef4444'
          }}
        >
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          Access Restricted
        </h2>
        <p style={{ color: 'var(--text-muted, #94a3b8)', maxWidth: '400px', fontSize: '0.95rem' }}>
          This administrative module requires Administrator privileges. Your current role is Staff.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
