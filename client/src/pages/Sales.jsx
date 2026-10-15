import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Receipt,
  Search,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Hash,
  Download
} from 'lucide-react';
import { getMedicines } from '../services/medicineService';
import { getSales, createSale } from '../services/saleService';
import { useInventory } from '../context/InventoryContext';
import Pagination from '../components/Common/Pagination';

const Sales = () => {
  const { triggerRefresh, showToast } = useInventory();
  const [medicines, setMedicines] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State for Sales
  const [salesPage, setSalesPage] = useState(1);
  const [salesTotalPages, setSalesTotalPages] = useState(1);
  const [salesTotalCount, setSalesTotalCount] = useState(0);

  // Form State
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [patientOrBuyer, setPatientOrBuyer] = useState('Outpatient Clinic');
  const [prescriptionNo, setPrescriptionNo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedMedicine = medicines.find((m) => m._id === selectedMedicineId);
  const unitPrice = selectedMedicine ? selectedMedicine.price : 0;
  const totalPrice = Number((quantity * unitPrice).toFixed(2));
  const availableStock = selectedMedicine ? selectedMedicine.quantity : 0;
  const isOutOfStock = availableStock <= 0;
  const isStockInsufficient = quantity > availableStock;

  const loadMedicines = async () => {
    try {
      const medRes = await getMedicines();
      if (medRes.success) {
        setMedicines(medRes.data);
        if (medRes.data?.length > 0 && !selectedMedicineId) {
          setSelectedMedicineId(medRes.data[0]._id);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesRes = await getSales({ page: salesPage, limit: 10 });
      if (salesRes.success) {
        setSalesHistory(salesRes.data);
        setSalesTotalPages(salesRes.totalPages || 1);
        setSalesTotalCount(salesRes.totalCount !== undefined ? salesRes.totalCount : salesRes.count || 0);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    loadSales();
  }, [salesPage]);

  const handleExportSalesCSV = () => {
    if (salesHistory.length === 0) {
      showToast('No sales data to export', 'warning');
      return;
    }
    const headers = ['Date', 'Medicine', 'Prescription', 'Patient / Ward', 'Units Sold', 'Unit Price ($)', 'Total ($)'];
    const rows = salesHistory.map((s) => [
      new Date(s.date).toISOString().slice(0, 10),
      `"${s.medicineName || s.medicineId?.name || 'N/A'}"`,
      `"${s.prescriptionNo || 'N/A'}"`,
      `"${s.patientOrBuyer || 'Walk-in'}"`,
      s.quantitySold,
      s.unitPrice,
      s.totalPrice
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DoseFlow_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    if (!selectedMedicineId) {
      showToast('Please choose a medicine to dispense', 'error');
      return;
    }
    if (quantity <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }
    if (isStockInsufficient) {
      showToast(`Cannot dispense ${quantity}. Only ${availableStock} units available.`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createSale({
        medicineId: selectedMedicineId,
        quantitySold: Number(quantity),
        patientOrBuyer,
        prescriptionNo: prescriptionNo || `RX-${Math.floor(1000 + Math.random() * 9000)}`
      });

      if (res.success) {
        showToast(res.message || 'Dispensed successfully!');
        setPrescriptionNo('');
        setQuantity(1);
        await Promise.all([loadMedicines(), loadSales()]);
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingCart color="var(--cyan-primary)" size={28} />
            Medicine Dispense & Sales Terminal
          </h1>
          <p className="page-subtitle">
            Record outpatient sales and inpatient ward distributions with real-time stock deduction.
          </p>
        </div>
      </div>

      {/* Main Grid: Dispense Form & Live Calculator */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Dispense Entry Form */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Receipt size={20} color="var(--primary)" />
            New Dispensing Transaction
          </h3>

          <form onSubmit={handleDispense}>
            <div className="form-group">
              <label className="form-label">Select Medicine to Dispense *</label>
              <select
                className="form-select"
                value={selectedMedicineId}
                onChange={(e) => {
                  setSelectedMedicineId(e.target.value);
                  setQuantity(1);
                }}
                required
              >
                {medicines.map((m) => (
                  <option key={m._id} value={m._id} disabled={m.quantity === 0}>
                    {m.name} (Batch: {m.batchNo}) — In Stock: {m.quantity} — ${m.price.toFixed(2)}
                    {m.quantity === 0 ? ' [OUT OF STOCK]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Dispense Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={availableStock > 0 ? availableStock : 1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-input"
                  disabled={isOutOfStock}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Price ($)</label>
                <input
                  type="text"
                  disabled
                  value={`$${unitPrice.toFixed(2)}`}
                  className="form-input"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--primary)', fontWeight: 600 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Patient / Receiving Ward</label>
                <input
                  type="text"
                  placeholder="e.g. ICU Bed 04 / Dr. Carter"
                  value={patientOrBuyer}
                  onChange={(e) => setPatientOrBuyer(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prescription / Rx Ref</label>
                <input
                  type="text"
                  placeholder="e.g. RX-2026-8942"
                  value={prescriptionNo}
                  onChange={(e) => setPrescriptionNo(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Validation warning */}
            {isStockInsufficient && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem'
                }}
              >
                <AlertCircle size={16} />
                <span>
                  Insufficient inventory! Requested {quantity} units, but only {availableStock} are currently on shelf.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isOutOfStock || isStockInsufficient}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                opacity: isOutOfStock || isStockInsufficient ? 0.5 : 1
              }}
            >
              {submitting ? 'Processing Transaction...' : 'Complete Dispense & Deduct Stock'}
            </button>
          </form>
        </div>

        {/* Live Calculation Bill Summary */}
        <div
          className="glass-card"
          style={{
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Transaction Summary
          </h3>

          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Selected Drug:</span>
              <strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                {selectedMedicine?.name || 'None selected'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Batch Code:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
                {selectedMedicine?.batchNo || '—'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Available On Shelf:</span>
              <span style={{ fontWeight: 700, color: availableStock > 10 ? 'var(--success)' : 'var(--warning)' }}>
                {availableStock} units
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Units Dispensed:</span>
              <span style={{ fontWeight: 600 }}>{quantity} units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Remaining After Sale:</span>
              <span style={{ fontWeight: 700, color: availableStock - quantity < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                {Math.max(0, availableStock - quantity)} units
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Calculated Bill</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto computed: Qty × Unit Price</div>
            </div>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '-0.02em'
              }}
            >
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Dispensing History Table */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Dispense History & Audit Trail
          </h3>
          <button
            onClick={handleExportSalesCSV}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Export Sales CSV</span>
          </button>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Medicine Dispensed</th>
                <th>Prescription Ref</th>
                <th>Patient / Ward</th>
                <th>Quantity Sold</th>
                <th>Unit Price</th>
                <th>Total Bill</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : salesHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                salesHistory.map((s) => {
                  const d = new Date(s.date);
                  return (
                    <tr key={s._id}>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{d.toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.medicineName || s.medicineId?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Batch: {s.medicineId?.batchNo || 'Archived'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--cyan-primary)' }}>
                          {s.prescriptionNo || '—'}
                        </span>
                      </td>
                      <td>{s.patientOrBuyer || 'Walk-in'}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{s.quantitySold} units</span>
                      </td>
                      <td>${s.unitPrice?.toFixed(2)}</td>
                      <td>
                        <strong style={{ color: '#34d399' }}>${s.totalPrice?.toFixed(2)}</strong>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={salesPage}
            totalPages={salesTotalPages}
            totalCount={salesTotalCount}
            pageSize={10}
            onPageChange={setSalesPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Sales;
