import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarX,
  AlertCircle,
  Clock,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { getLowStockAlerts, getExpiryAlerts } from '../services/dashboardService';
import { useInventory } from '../context/InventoryContext';

const Alerts = () => {
  const navigate = useNavigate();
  const { refreshIndex } = useInventory();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'low_stock', 'near_expiry', 'expired'
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertsData = async () => {
    try {
      setLoading(true);
      const [lowRes, expRes] = await Promise.all([
        getLowStockAlerts(),
        getExpiryAlerts(45)
      ]);

      if (lowRes.success) setLowStockAlerts(lowRes.data);
      if (expRes.success) setExpiryAlerts(expRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, [refreshIndex]);

  const expiredList = expiryAlerts.filter((a) => a.daysUntilExpiry <= 0);
  const nearingExpiryList = expiryAlerts.filter((a) => a.daysUntilExpiry > 0);

  let displayedAlerts = [];
  if (activeTab === 'all') {
    displayedAlerts = [
      ...lowStockAlerts.map((a) => ({ ...a, categoryType: 'low_stock' })),
      ...expiryAlerts.map((a) => ({ ...a, categoryType: a.daysUntilExpiry <= 0 ? 'expired' : 'near_expiry' }))
    ];
  } else if (activeTab === 'low_stock') {
    displayedAlerts = lowStockAlerts.map((a) => ({ ...a, categoryType: 'low_stock' }));
  } else if (activeTab === 'near_expiry') {
    displayedAlerts = nearingExpiryList.map((a) => ({ ...a, categoryType: 'near_expiry' }));
  } else if (activeTab === 'expired') {
    displayedAlerts = expiredList.map((a) => ({ ...a, categoryType: 'expired' }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldAlert color="#f43f5e" size={28} />
            Clinical Alerts & Expiry Monitoring
          </h1>
          <p className="page-subtitle">
            Automated alerts for safety stock deficits, impending batch expirations, and quarantine protocols.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          All Active Alerts ({lowStockAlerts.length + expiryAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('low_stock')}
          className={`btn ${activeTab === 'low_stock' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Low Stock ({lowStockAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('near_expiry')}
          className={`btn ${activeTab === 'near_expiry' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Near Expiry ({nearingExpiryList.length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`btn ${activeTab === 'expired' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Expired Batches ({expiredList.length})
        </button>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading safety alerts...
        </div>
      ) : displayedAlerts.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={30} color="#34d399" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No Active Alerts in this Category
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.875rem' }}>
            All medicine stocks are safely above reorder thresholds and no batches are nearing expiration.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayedAlerts.map((item, index) => {
            const isExpired = item.categoryType === 'expired';
            const isNearExpiry = item.categoryType === 'near_expiry';
            const isLowStock = item.categoryType === 'low_stock';

            const borderColor = isExpired
              ? 'rgba(244, 63, 94, 0.4)'
              : isLowStock && item.quantity === 0
              ? 'rgba(244, 63, 94, 0.4)'
              : 'rgba(245, 158, 11, 0.3)';

            return (
              <div
                key={`${item._id}-${index}`}
                className="glass-card"
                style={{
                  padding: '1.4rem 1.6rem',
                  borderLeft: `4px solid ${
                    isExpired || item.quantity === 0 ? '#f43f5e' : '#f59e0b'
                  }`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
              >
                {/* Left details */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: isExpired
                        ? 'rgba(244, 63, 94, 0.15)'
                        : isLowStock
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(168, 85, 247, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isExpired ? (
                      <CalendarX size={24} color="#fb7185" />
                    ) : isLowStock ? (
                      <AlertTriangle size={24} color="#fbbf24" />
                    ) : (
                      <Clock size={24} color="#c084fc" />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.name}
                      </h3>
                      <span
                        className={`badge ${
                          item.severity === 'CRITICAL' ? 'badge-critical' : 'badge-low-stock'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {item.message}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '1.25rem',
                        marginTop: '0.5rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span>
                        Batch: <strong style={{ color: 'var(--cyan-primary)' }}>{item.batchNo}</strong>
                      </span>
                      <span>
                        Shelf: <strong style={{ color: 'var(--text-primary)' }}>{item.shelfLocation || 'Main'}</strong>
                      </span>
                      {item.supplierId && (
                        <span>
                          Supplier: <strong style={{ color: 'var(--text-primary)' }}>{item.supplierId.name}</strong>
                          {item.supplierId.phone && ` (${item.supplierId.phone})`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {isExpired ? (
                    <span
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(244, 63, 94, 0.15)',
                        color: '#fda4af',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        border: '1px solid rgba(244, 63, 94, 0.3)'
                      }}
                    >
                      Quarantined from Dispense
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        navigate('/purchases', {
                          state: {
                            prefillMedicineId: item._id,
                            prefillSupplierId: item.supplierId?._id,
                            prefillQuantity: Math.max(item.reorderThreshold * 2, 50)
                          }
                        });
                      }}
                    >
                      <span>Initiate Restock</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
