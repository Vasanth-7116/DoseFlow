import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Download,
  CheckCircle2,
  Calendar,
  PackageX
} from 'lucide-react';
import Modal from '../components/Common/Modal';
import StatusBadge from '../components/Common/StatusBadge';
import Pagination from '../components/Common/Pagination';
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  removeFromShelf
} from '../services/medicineService';
import { getSuppliers } from '../services/supplierService';
import { useInventory } from '../context/InventoryContext';
import useDebounce from '../hooks/useDebounce';

const Inventory = () => {
  const { triggerRefresh, showToast } = useInventory();
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    batchNo: '',
    category: 'Antibiotics',
    quantity: '',
    expiryDate: '',
    price: '',
    unitCost: '',
    supplierId: '',
    reorderThreshold: '50',
    shelfLocation: 'Rack A-01'
  });

  const categories = [
    'All',
    'Antibiotics',
    'Analgesics',
    'Cardiovascular',
    'Respiratory',
    'Emergency / Critical',
    'IV Fluids',
    'General'
  ];

  const fetchInventory = async (signal) => {
    try {
      setLoading(true);
      const res = await getMedicines(
        {
          search: debouncedSearch,
          category: categoryFilter,
          status: statusFilter,
          page: currentPage,
          limit: 8
        },
        signal ? { signal } : {}
      );
      if (res.success) {
        setMedicines(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount !== undefined ? res.totalCount : res.count || 0);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.message !== 'canceled') {
        showToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliersList = async () => {
    try {
      const res = await getSuppliers();
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryFilter, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchInventory(controller.signal);
    return () => {
      controller.abort();
    };
  }, [debouncedSearch, categoryFilter, statusFilter, currentPage]);

  useEffect(() => {
    fetchSuppliersList();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      batchNo: `MED-${Date.now().toString().slice(-5)}`,
      category: 'Antibiotics',
      quantity: '50',
      expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      price: '15.00',
      unitCost: '9.00',
      supplierId: suppliers[0]?._id || '',
      reorderThreshold: '50',
      shelfLocation: 'Rack A-01'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name,
      batchNo: med.batchNo,
      category: med.category || 'General',
      quantity: med.quantity,
      expiryDate: new Date(med.expiryDate).toISOString().split('T')[0],
      price: med.price,
      unitCost: med.unitCost || 0,
      supplierId: med.supplierId?._id || med.supplierId || '',
      reorderThreshold: med.reorderThreshold || 50,
      shelfLocation: med.shelfLocation || 'Main Storage'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.supplierId) {
        showToast('Please select a supplier', 'error');
        return;
      }

      if (editingMedicine) {
        await updateMedicine(editingMedicine._id, formData);
        showToast('Medicine updated successfully');
      } else {
        await createMedicine(formData);
        showToast('Medicine added to inventory');
      }
      setIsModalOpen(false);
      fetchInventory();
      triggerRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicine(id);
      showToast('Medicine removed from inventory');
      setDeleteConfirmId(null);
      fetchInventory();
      triggerRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveFromShelf = async (med) => {
    try {
      const res = await removeFromShelf(med._id);
      showToast(res.message || `Decommissioned ${med.quantity} unit(s) of ${med.name} to Quarantine.`);
      fetchInventory();
      triggerRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Batch No', 'Category', 'Quantity', 'Price ($)', 'Expiry Date', 'Supplier', 'Threshold'];
    const rows = medicines.map((m) => [
      `"${m.name}"`,
      m.batchNo,
      m.category,
      m.quantity,
      m.price,
      new Date(m.expiryDate).toLocaleDateString(),
      `"${m.supplierId?.name || 'N/A'}"`,
      m.reorderThreshold
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DoseFlow_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Pill color="var(--primary)" size={28} />
            Medicine Inventory Catalog
          </h1>
          <p className="page-subtitle">
            Manage hospital pharmaceutical batches, dosage formulations, unit pricing, and thresholds.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="Export as CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by medicine name or batch code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="all">All Items</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Medicine Name & Batch</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Unit Price</th>
              <th>Expiry Date</th>
              <th>Supplier</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading medicines...
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No medicines found matching your criteria.
                </td>
              </tr>
            ) : (
              medicines.map((med) => {
                const expiry = new Date(med.expiryDate);
                return (
                  <tr key={med._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{med.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                        Batch: {med.batchNo} • Shelf: {med.shelfLocation || 'Main'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {med.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {med.quantity}{' '}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          units (min: {med.reorderThreshold})
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>${Number(med.price).toFixed(2)}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{expiry.toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {med.supplierId?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        quantity={med.quantity}
                        reorderThreshold={med.reorderThreshold}
                        expiryDate={med.expiryDate}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {expiry <= new Date() && med.quantity > 0 && (
                          <button
                            onClick={() => handleRemoveFromShelf(med)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '0.35rem 0.6rem',
                              color: 'var(--danger-text)',
                              borderColor: 'var(--danger-border)'
                            }}
                            title="Decommission expired units from active shelf to Quarantine"
                          >
                            <PackageX size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(med)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                          title="Edit medicine"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(med._id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                          title="Delete medicine"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={8}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedicine ? 'Edit Medicine Details' : 'Add New Medicine Batch'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Medicine Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amoxicillin 500mg Capsules"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Batch Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. AMX-2026-A1"
                value={formData.batchNo}
                onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Therapeutic Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dispense Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Threshold *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.reorderThreshold}
                onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Primary Supplier *</label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="form-select"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Storage Location</label>
              <input
                type="text"
                placeholder="e.g. Rack A-01"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMedicine ? 'Update Medicine' : 'Save to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you sure you want to delete this medicine record? This action will permanently remove it from the inventory registry.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-danger">
              Delete Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
