import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ShieldCheck, Clock, PlusCircle, LogOut } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { alertCount, stats } = useInventory();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Initials for avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DF';

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      {/* Left: Department & Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Central Hospital Pharmacy
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Station #01</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}
        >
          <Clock size={14} color="var(--primary)" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Right: Quick actions, notifications, user avatar & logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Dispense CTA */}
        <Link
          to="/sales"
          className="btn btn-primary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <PlusCircle size={15} />
          <span>New Dispense</span>
        </Link>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: alertCount > 0 ? 'var(--danger-bg)' : 'var(--bg-tertiary)',
            border: alertCount > 0 ? '1px solid var(--danger-border)' : '1px solid var(--border-subtle)',
            color: alertCount > 0 ? 'var(--danger)' : 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'all var(--transition-fast)'
          }}
          title={alertCount > 0 ? `${alertCount} critical inventory alerts` : 'All alerts resolved'}
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)'
              }}
            >
              {alertCount}
            </span>
          )}
        </Link>

        {/* User profile & Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 0.6rem 0.35rem 0.4rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: user?.role === 'admin' ? 'var(--grad-purple-pink)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#ffffff'
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name || 'Authorized User'}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: user?.role === 'admin' ? '#7C3AED' : 'var(--primary)'
              }}
            >
              {user?.role === 'admin' ? 'Administrator' : 'Staff Pharmacist'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '4px',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
