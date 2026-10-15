import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Pill,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Modal from '../components/Common/Modal';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../services/supplierService';
import { useInventory } from '../context/InventoryContext';
import useDebounce from '../hooks/useDebounce';

const Suppliers = () => {
  const { triggerRefresh, showToast } = useInventory();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchSuppliersList = async (signal) => {
    try {
      setLoading(true);
      const res = await getSuppliers({ search: debouncedSearch }, signal ? { signal } : {});
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.message !== 'canceled') {
        showToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchSuppliersList(controller.signal);
    return () => {
      controller.abort();
    };
  }, [debouncedSearch]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, formData);
        showToast('Supplier updated successfully');
      } else {
        await createSupplier(formData);
        showToast('New supplier registered');
      }
      setIsModalOpen(false);
      fetchSuppliersList();
      triggerRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSupplier(id);
      showToast('Supplier removed');
      setDeleteConfirmId(null);
      fetchSuppliersList();
      triggerRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Building2 color="var(--cyan-primary)" size={28} />
            Pharmaceutical Suppliers Directory
          </h1>
          <p className="page-subtitle">
            Manage pharmaceutical vendors, verified contacts, delivery logistics, and linked catalogues.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search suppliers by name, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Suppliers Grid / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading suppliers directory...
        </div>
      ) : suppliers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No suppliers found matching your query.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {suppliers.map((sup) => {
            const isExpanded = expandedSupplierId === sup._id;
            const medicinesCount = sup.medicinesSupplied?.length || 0;

            return (
              <div
                key={sup._id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Building2 size={24} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {sup.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Contact Person: <strong style={{ color: 'var(--text-primary)' }}>{sup.contactPerson || 'Not listed'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleOpenEditModal(sup)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Supplier"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(sup._id)}
                      className="btn btn-danger btn-sm"
                      title="Delete Supplier"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Details Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Phone size={16} color="var(--primary)" />
                    <span>{sup.phone}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Mail size={16} color="var(--primary)" />
                    <span>{sup.email || 'No email provided'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <MapPin size={16} color="var(--amber-primary)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sup.address || 'Address on file'}
                    </span>
                  </div>
                </div>

                {/* Linked Medicines Accordion Header */}
                <div
                  onClick={() => toggleExpand(sup._id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill size={16} color="var(--cyan-primary)" />
                    <span>
                      Supplies <strong style={{ color: 'var(--text-primary)' }}>{medicinesCount}</strong> hospital catalog item(s)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>{isExpanded ? 'Hide Medicines' : 'View Supplied Medicines'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Medicines List */}
                {isExpanded && (
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                      padding: '1rem',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {medicinesCount === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        No medicines currently linked to this supplier.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                          gap: '0.75rem'
                        }}
                      >
                        {sup.medicinesSupplied.map((med) => (
                          <div
                            key={med._id}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: '#ffffff',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem'
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              {med.name}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span>Stock: {med.quantity}</span>
                              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>${med.price?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Update Supplier Profile' : 'Register New Supplier'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company / Supplier Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Pharma Laboratories"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Dr. Robert Vance"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="orders@supplier.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Office / Warehouse Address</label>
            <textarea
              rows={2}
              placeholder="Warehouse address or shipping terminal..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="form-textarea"
            />
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
              {editingSupplier ? 'Save Changes' : 'Register Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Supplier Removal"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you sure you want to remove this supplier? Suppliers with active medicine dependencies cannot be removed until their medicines are reassigned.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-danger">
              Delete Supplier
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
