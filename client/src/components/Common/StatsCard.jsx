import React from 'react';

const StatsCard = React.memo(({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) => {
  const colorMap = {
    cyan: {
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.3)',
      text: '#38bdf8',
      iconColor: '#06b6d4',
      gradient: 'var(--grad-cyan-blue)'
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#34d399',
      iconColor: '#10b981',
      gradient: 'var(--grad-teal-emerald)'
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
      iconColor: '#f59e0b',
      gradient: 'var(--grad-amber-rose)'
    },
    rose: {
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.3)',
      text: '#fb7185',
      iconColor: '#f43f5e',
      gradient: 'linear-gradient(135deg, #f43f5e, #be123c)'
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.3)',
      text: '#c084fc',
      iconColor: '#a855f7',
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
        overflow: 'hidden'
      }}
    >
      {/* Glow background accent - performant gradient without heavy blur filter */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '90px',
          height: '90px',
          background: `radial-gradient(circle at top right, ${theme.border} 0%, ${theme.bg} 40%, transparent 70%)`,
          borderRadius: '0 16px 0 50%',
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
