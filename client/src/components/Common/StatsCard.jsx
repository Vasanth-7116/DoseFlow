import React from 'react';

const StatsCard = React.memo(({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) => {
  const colorMap = {
    cyan: {
      bg: 'rgba(15, 118, 110, 0.08)',
      border: 'rgba(15, 118, 110, 0.22)',
      text: '#0F766E',
      iconColor: '#0F766E',
      gradient: 'var(--grad-primary)'
    },
    emerald: {
      bg: 'rgba(5, 150, 105, 0.08)',
      border: 'rgba(5, 150, 105, 0.22)',
      text: '#047857',
      iconColor: '#059669',
      gradient: 'var(--grad-teal-emerald)'
    },
    amber: {
      bg: 'rgba(217, 119, 6, 0.08)',
      border: 'rgba(217, 119, 6, 0.22)',
      text: '#B45309',
      iconColor: '#D97706',
      gradient: 'var(--grad-amber-rose)'
    },
    rose: {
      bg: 'rgba(220, 38, 38, 0.08)',
      border: 'rgba(220, 38, 38, 0.22)',
      text: '#B91C1C',
      iconColor: '#DC2626',
      gradient: 'linear-gradient(135deg, #DC2626, #991B1B)'
    },
    purple: {
      bg: 'rgba(124, 58, 237, 0.08)',
      border: 'rgba(124, 58, 237, 0.22)',
      text: '#6D28D9',
      iconColor: '#7C3AED',
      gradient: 'var(--grad-purple-pink)'
    }
  };

  const theme = colorMap[color] || colorMap.cyan;

  return (
    <div
      className="glass-card glass-card-interactive"
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface)'
      }}
    >
      {/* Subtle glow background accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '90px',
          height: '90px',
          background: `radial-gradient(circle at top right, ${theme.bg} 0%, transparent 70%)`,
          borderRadius: '0 14px 0 50%',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {Icon && <Icon size={20} color={theme.iconColor} strokeWidth={2.2} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em'
          }}
        >
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.78rem', color: theme.text, fontWeight: 600 }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
});

export default StatsCard;
