import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #94a3b8)' }}>
        Showing <strong style={{ color: '#ffffff' }}>{startItem}</strong> to{' '}
        <strong style={{ color: '#ffffff' }}>{endItem}</strong> of{' '}
        <strong style={{ color: '#ffffff' }}>{totalCount}</strong> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            color: currentPage <= 1 ? 'var(--text-muted, #64748b)' : '#ffffff',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0 6px',
                  color: 'var(--text-muted, #64748b)',
                  fontSize: '0.85rem'
                }}
              >
                ...
              </span>
            );
          }
          const isActive = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(p)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: isActive
                  ? 'var(--grad-cyan-blue, linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%))'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isActive
                  ? '1px solid transparent'
                  : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(6, 182, 212, 0.35)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            color: currentPage >= totalPages ? 'var(--text-muted, #64748b)' : '#ffffff',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
