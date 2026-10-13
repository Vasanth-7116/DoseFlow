import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  AlertTriangle,
  CalendarX,
  TrendingUp,
  DollarSign,
  Package,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import StatsCard from '../components/Common/StatsCard';
import {
  getDashboardStats,
  getSalesComparison,
  getReorderSuggestions,
  getLowStockAlerts
} from '../services/dashboardService';
import { useInventory } from '../context/InventoryContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { refreshIndex, stats: contextStats, fetchGlobalStats } = useInventory();
  const [localStats, setLocalStats] = useState(null);
  const [salesComparison, setSalesComparison] = useState({ topSelling: [], leastSelling: [] });
  const [chartMode, setChartMode] = useState('top'); // 'top' or 'least'
  const [suggestions, setSuggestions] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = contextStats || localStats;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const promises = [
        getSalesComparison(),
        getReorderSuggestions(),
        getLowStockAlerts()
      ];
      if (!contextStats) {
        promises.push(getDashboardStats());
      }

      const results = await Promise.all(promises);
      const [salesRes, suggRes, alertsRes, statsRes] = results;

      if (salesRes.success) setSalesComparison(salesRes.data);
      if (suggRes.success) setSuggestions(suggRes.data.slice(0, 5));
      if (alertsRes.success) setRecentAlerts(alertsRes.data.slice(0, 4));
      if (statsRes?.success) setLocalStats(statsRes.data);
      if (fetchGlobalStats) fetchGlobalStats();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [contextStats, fetchGlobalStats]);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshIndex]);

  const chartData = useMemo(() => {
    const list = chartMode === 'top' ? salesComparison.topSelling : salesComparison.leastSelling;
    return (list || []).map((item) => ({
      name: item.name.length > 18 ? item.name.slice(0, 16) + '...' : item.name,
      units: item.totalUnitsSold,
      revenue: item.totalRevenue,
      fullName: item.name
    }));
  }, [chartMode, salesComparison]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Pill color="var(--cyan-primary)" size={28} />
            Pharmacy Inventory Command Center
          </h1>
          <p className="page-subtitle">
            Real-time stock velocity, automated expiry monitoring, and algorithmic reorder predictions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            title="Refresh statistics"
          >
            <RefreshCw size={15} className={loading ? 'pulse-glow' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/sales" className="btn btn-primary btn-sm">
            <ShoppingCart size={15} />
            <span>Dispense Medicine</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatsCard
          title="TOTAL MEDICINES"
          value={stats?.totalMedicines ?? '—'}
          subtitle={`${stats?.inStockCount ?? 0} well-stocked`}
          icon={Package}
          color="cyan"
        />
        <StatsCard
          title="LOW STOCK WARNINGS"
          value={stats?.lowStockCount ?? '—'}
          subtitle="At or below threshold"
          icon={AlertTriangle}
          color="amber"
          trend={stats?.lowStockCount > 0 ? 'Requires Action' : 'Optimal'}
        />
        <StatsCard
          title="EXPIRED BATCHES"
          value={stats?.expiredCount ?? '—'}
          subtitle={`${stats?.nearExpiryCount ?? 0} nearing in 30d`}
          icon={CalendarX}
          color="rose"
          trend={stats?.expiredCount > 0 ? 'Immediate Quarantine' : 'Zero Expired'}
        />
        <StatsCard
          title="INVENTORY VALUATION"
          value={stats ? `$${stats.totalInventoryValue.toLocaleString()}` : '—'}
          subtitle="Total assets on shelf"
          icon={DollarSign}
          color="emerald"
        />
        <StatsCard
          title="TOTAL DISPENSED SALES"
          value={stats ? `$${stats.totalRevenue.toLocaleString()}` : '—'}
          subtitle={`${stats?.totalUnitsSold ?? 0} units dispensed`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Middle Section: Chart & Stock Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}
      >
        {/* Sales Velocity Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Dispensing Analytics & Velocity
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Comparing medicine demand across inpatient and outpatient wards
              </p>
            </div>

            {/* Toggle Switch */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                onClick={() => setChartMode('top')}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: chartMode === 'top' ? 'var(--cyan-primary)' : 'transparent',
                  color: chartMode === 'top' ? '#000000' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Top Selling
              </button>
              <button
                onClick={() => setChartMode('least')}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: chartMode === 'least' ? '#f59e0b' : 'transparent',
                  color: chartMode === 'least' ? '#000000' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Slowest Moving
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                  formatter={(val, name, item) => [
                    `${val} units ($${item.payload.revenue.toFixed(2)})`,
                    'Quantity Sold'
                  ]}
                  labelFormatter={(name, payload) => payload?.[0]?.payload?.fullName || name}
                />
                <Bar dataKey="units" radius={[6, 6, 0, 0]} animationDuration={350}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartMode === 'top' ? '#06b6d4' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status & Fast Summary */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Stock Health Status
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Current inventory equilibrium
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Normal Stocked</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
                {stats?.inStockCount ?? 0}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <AlertCircle size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Low / Out of Stock</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
                {stats?.lowStockCount ?? 0}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CalendarX size={18} color="#fb7185" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Expired / In Quarantine</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb7185' }}>
                {stats?.expiredCount ?? 0}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <Link
              to="/alerts"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--cyan-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <span>View All Alerts & Near-Expiry Items</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Reorder Suggestions Engine & Recent Alerts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.7fr 1fr',
          gap: '1.5rem'
        }}
      >
        {/* Smart Suggestion Engine Panel */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={18} color="var(--cyan-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Smart Reorder Recommendations
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Rule-based engine factoring 30-day burn rate, stock deficit, and expiry buffer
                </p>
              </div>
            </div>

            <Link
              to="/purchases"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              <span>Restock Console</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {suggestions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              All inventory levels are currently above reorder safety targets!
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Current Stock</th>
                    <th>Suggested Qty</th>
                    <th>Urgency</th>
                    <th>Est. Cost</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map((s) => (
                    <tr key={s.medicineId}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {s.reasons.join(' • ')}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: s.currentStock === 0 ? '#fb7185' : '#fbbf24'
                          }}
                        >
                          {s.currentStock} units
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--cyan-primary)' }}>
                          +{s.suggestedQuantity}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.urgency === 'CRITICAL'
                              ? 'badge-critical'
                              : s.urgency === 'HIGH'
                              ? 'badge-low-stock'
                              : 'badge-info'
                          }`}
                        >
                          {s.urgency}
                        </span>
                      </td>
                      <td>${s.estimatedTotalCost.toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            navigate('/purchases', {
                              state: {
                                prefillMedicineId: s.medicineId,
                                prefillQuantity: s.suggestedQuantity,
                                prefillSupplierId: s.supplier?._id,
                                prefillUnitCost: s.estimatedUnitCost
                              }
                            });
                          }}
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Quick Watchlist */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Critical Stock Deficits
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Medicines at or below threshold
              </p>
            </div>
            <Link to="/inventory" style={{ color: 'var(--cyan-primary)', fontSize: '0.8rem', textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentAlerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No critical stock deficits.
              </p>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {alert.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Batch: {alert.batchNo} • Shelf: {alert.shelfLocation || 'Main'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: alert.quantity === 0 ? '#fb7185' : '#fbbf24'
                      }}
                    >
                      {alert.quantity} / {alert.reorderThreshold}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Units Left</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
