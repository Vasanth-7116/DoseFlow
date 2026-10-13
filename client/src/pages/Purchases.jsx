import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PackagePlus,
  Truck,
  DollarSign,
  Receipt,
  FileCheck,
  Calendar,
  CheckCircle2,
  Download
} from 'lucide-react';
import { getMedicines } from '../services/medicineService';
import { getSuppliers } from '../services/supplierService';
import { getPurchases, createPurchase } from '../services/purchaseService';
import { useInventory } from '../context/InventoryContext';
import Pagination from '../components/Common/Pagination';

const Purchases = () => {
  const location = useLocation();
  const { triggerRefresh, showToast } = useInventory();
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination State for Purchases
  const [purPage, setPurPage] = useState(1);
  const [purTotalPages, setPurTotalPages] = useState(1);
  const [purTotalCount, setPurTotalCount] = useState(0);

  // Form State (supports prefill from dashboard smart suggestion engine!)
  const [selectedMedicineId, setSelectedMedicineId] = useState(location.state?.prefillMedicineId || '');
  const [selectedSupplierId, setSelectedSupplierId] = useState(location.state?.prefillSupplierId || '');
  const [quantityPurchased, setQuantityPurchased] = useState(location.state?.prefillQuantity || 100);
  const [unitCost, setUnitCost] = useState(location.state?.prefillUnitCost || '');
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [batchNo, setBatchNo] = useState('');

  const loadInitialData = async () => {
    try {
      const [medRes, supRes] = await Promise.all([
        getMedicines(),
        getSuppliers()
      ]);

      if (medRes.success) {
        setMedicines(medRes.data);
        if (!selectedMedicineId && medRes.data.length > 0) {
          setSelectedMedicineId(medRes.data[0]._id);
          setUnitCost(medRes.data[0].unitCost || Math.round(medRes.data[0].price * 0.7));
          setBatchNo(medRes.data[0].batchNo);
        }
      }

      if (supRes.success) {
        setSuppliers(supRes.data);
        if (!selectedSupplierId && supRes.data.length > 0) {
          setSelectedSupplierId(supRes.data[0]._id);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const purRes = await getPurchases({ page: purPage, limit: 10 });
      if (purRes.success) {
        setPurchaseHistory(purRes.data);
        setPurTotalPages(purRes.totalPages || 1);
        setPurTotalCount(purRes.totalCount !== undefined ? purRes.totalCount : purRes.count || 0);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [purPage]);

  const handleExportPurchasesCSV = () => {
    if (purchaseHistory.length === 0) {
      showToast('No restock data to export', 'warning');
      return;
    }
    const headers = ['Date', 'Medicine', 'Supplier', 'Invoice No', 'Batch', 'Qty Added', 'Unit Cost ($)', 'Total Cost ($)'];
    const rows = purchaseHistory.map((p) => [
      new Date(p.date).toISOString().slice(0, 10),
      `"${p.medicineName || p.medicineId?.name || 'N/A'}"`,
      `"${p.supplierName || p.supplierId?.name || 'N/A'}"`,
      `"${p.invoiceNo || 'N/A'}"`,
      `"${p.batchNo || 'N/A'}"`,
      p.quantityPurchased,
      p.unitCost,
      p.totalCost
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DoseFlow_Restock_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // When medicine changes, update default supplier and cost
  const handleMedicineChange = (e) => {
    const medId = e.target.value;
    setSelectedMedicineId(medId);
    const med = medicines.find((m) => m._id === medId);
    if (med) {
      setUnitCost(med.unitCost || Math.round(med.price * 0.7));
      setBatchNo(med.batchNo);
      if (med.supplierId?._id) {
        setSelectedSupplierId(med.supplierId._id);
      }
    }
  };

  const currentMedicine = medicines.find((m) => m._id === selectedMedicineId);
  const currentSupplier = suppliers.find((s) => s._id === selectedSupplierId);
  const calculatedTotalCost = Number((quantityPurchased * (Number(unitCost) || 0)).toFixed(2));

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedicineId || !selectedSupplierId) {
      showToast('Please select both medicine and supplier', 'error');
      return;
    }
    if (quantityPurchased <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createPurchase({
        medicineId: selectedMedicineId,
        supplierId: selectedSupplierId,
        quantityPurchased: Number(quantityPurchased),
        unitCost: Number(unitCost) || 0,
        invoiceNo: invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
        batchNo: batchNo || currentMedicine?.batchNo
      });

      if (res.success) {
        showToast(res.message || 'Restock recorded and stock incremented!');
        setInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
        await Promise.all([loadInitialData(), loadPurchases()]);
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
            <PackagePlus color="var(--cyan-primary)" size={28} />
            Restock & Purchase Invoicing
          </h1>
          <p className="page-subtitle">
            Log supplier deliveries, replenish pharmacy inventory levels, and track procurement invoices.
          </p>
        </div>
      </div>

      {/* Main Grid: Form & Cost Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Restock Form */}
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
            <Truck size={20} color="var(--cyan-primary)" />
            Log Inbound Restock Shipment
          </h3>

          <form onSubmit={handleRestockSubmit}>
            <div className="form-group">
              <label className="form-label">Select Medicine to Restock *</label>
              <select
                className="form-select"
                value={selectedMedicineId}
                onChange={handleMedicineChange}
                required
              >
                {medicines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} — Current Stock: {m.quantity} — (Threshold: {m.reorderThreshold})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vendor / Supplier *</label>
              <select
                className="form-select"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                required
              >
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Quantity Received (Units) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantityPurchased}
                  onChange={(e) => setQuantityPurchased(Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Unit Cost ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Supplier Invoice Reference</label>
                <input
                  type="text"
                  placeholder="e.g. INV-APX-8492"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shipment Batch Number</label>
                <input
                  type="text"
                  placeholder="e.g. BATCH-2026-X"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-success"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {submitting ? 'Recording Shipment...' : 'Confirm Restock & Increment Stock'}
            </button>
          </form>
        </div>

        {/* Live Delivery Summary */}
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
            Procurement Summary
          </h3>

          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Drug:</span>
              <strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                {currentMedicine?.name || 'None'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Selected Vendor:</span>
              <span style={{ color: 'var(--cyan-primary)' }}>
                {currentSupplier?.name || 'None'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Stock Prior to Delivery:</span>
              <span style={{ fontWeight: 600 }}>{currentMedicine?.quantity || 0} units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Addition:</span>
              <span style={{ fontWeight: 700, color: '#34d399' }}>+{quantityPurchased} units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>New Projected Stock:</span>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                {(currentMedicine?.quantity || 0) + Number(quantityPurchased)} units
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Purchase Cost</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto computed: Units × Unit Cost</div>
            </div>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#34d399',
                letterSpacing: '-0.02em'
              }}
            >
              ${calculatedTotalCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Restock History Table */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Restock History & Invoicing Log
          </h3>
          <button
            onClick={handleExportPurchasesCSV}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Export Restock CSV</span>
          </button>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Medicine Restocked</th>
                <th>Supplier / Vendor</th>
                <th>Invoice Ref</th>
                <th>Batch Code</th>
                <th>Quantity Added</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading purchases...
                  </td>
                </tr>
              ) : purchaseHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No restock transactions logged yet.
                  </td>
                </tr>
              ) : (
                purchaseHistory.map((p) => {
                  const d = new Date(p.date);
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{d.toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.medicineName || p.medicineId?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Current Stock: {p.medicineId?.quantity ?? '—'}
                        </div>
                      </td>
                      <td>{p.supplierName || p.supplierId?.name}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--cyan-primary)' }}>
                          {p.invoiceNo}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {p.batchNo || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>+{p.quantityPurchased}</span>
                      </td>
                      <td>${p.unitCost?.toFixed(2)}</td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>${p.totalCost?.toFixed(2)}</strong>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={purPage}
            totalPages={purTotalPages}
            totalCount={purTotalCount}
            pageSize={10}
            onPageChange={setPurPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Purchases;
