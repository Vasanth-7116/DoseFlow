import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getDashboardStats } from '../services/dashboardService';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  const fetchGlobalStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load global stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats, refreshIndex]);

  const alertCount = useMemo(() => {
    return (stats?.lowStockCount || 0) + (stats?.expiredCount || 0) + (stats?.nearExpiryCount || 0);
  }, [stats?.lowStockCount, stats?.expiredCount, stats?.nearExpiryCount]);

  const contextValue = useMemo(
    () => ({
      stats,
      alertCount,
      refreshIndex,
      triggerRefresh,
      showToast,
      loading,
      fetchGlobalStats
    }),
    [stats, alertCount, refreshIndex, triggerRefresh, showToast, loading, fetchGlobalStats]
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '12px',
            background:
              toastMessage.type === 'error'
                ? 'linear-gradient(135deg, #e11d48, #be123c)'
                : toastMessage.type === 'warning'
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : 'linear-gradient(135deg, #059669, #047857)',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span>{toastMessage.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              marginLeft: '8px',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
