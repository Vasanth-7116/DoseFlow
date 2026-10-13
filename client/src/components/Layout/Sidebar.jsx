import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Building2,
  ShoppingCart,
  PackagePlus,
  AlertTriangle,
  Activity,
  Sparkles,
  Users
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { alertCount } = useInventory();
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Medicine Stock', icon: Pill },
    { to: '/suppliers', label: 'Suppliers', icon: Building2 },
    { to: '/sales', label: 'Sales & Dispensing', icon: ShoppingCart },
    { to: '/purchases', label: 'Restock / Purchases', icon: PackagePlus },
    {
      to: '/alerts',
      label: 'Alerts & Expiry',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : null
    },
    ...(isAdmin ? [{ to: '/staff', label: 'Staff Management', icon: Users }] : [])
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.75rem 1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--grad-cyan-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-cyan)'
          }}
        >
          <Activity size={24} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #ffffff, #93c5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              DoseFlow
            </span>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600
            }}
          >
            Hospital Pharmacy
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '1.25rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.14)' : 'transparent',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    color={isActive ? 'var(--cyan-primary)' : 'currentColor'}
                    strokeWidth={isActive ? 2.3 : 1.8}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#f43f5e',
                        color: '#ffffff',
                        boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Smart Engine Badge */}
      <div style={{ padding: '0 1rem 1.25rem' }}>
        <div
          className="glass-card"
          style={{
            padding: '0.9rem',
            borderRadius: '12px',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={16} color="var(--cyan-primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan-primary)' }}>
              Smart Suggestion Engine
            </span>
          </div>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Continuous sales burn rate & expiry analysis active.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
