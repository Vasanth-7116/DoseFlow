import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Trash2,
  Edit,
  Search,
  Mail,
  Calendar,
  Lock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getAllUsers, createStaffUser, updateStaffUser, deleteStaffUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import Modal from '../components/Common/Modal';
import StatsCard from '../components/Common/StatsCard';

const Staff = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useInventory();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('staff');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff'
    });
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createStaffUser(formData);
      if (res.success) {
        showToast('Staff member onboarded successfully!');
        setIsAddModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (u) => {
    setSelectedUser(u);
    setEditRole(u.role);
    setIsEditModalOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await updateStaffUser(selectedUser._id, { role: editRole });
      if (res.success) {
        showToast(`Role updated to ${editRole.toUpperCase()} for ${selectedUser.name}`);
        setIsEditModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      setSubmitting(true);
      const res = await deleteStaffUser(deleteTargetUser._id);
      if (res.success) {
        showToast('Staff account removed from system.');
        setDeleteTargetUser(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users color="var(--cyan-primary)" size={28} />
            Hospital Staff & User Registry
          </h1>
          <p className="page-subtitle">
            Administer pharmacy personnel, assign administrative privileges, and manage system access.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
          <UserPlus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatsCard
          title="TOTAL REGISTERED STAFF"
          value={users.length}
          subtitle="Active system accounts"
          icon={Users}
          color="cyan"
        />
        <StatsCard
          title="ADMINISTRATORS"
          value={adminCount}
          subtitle="Elevated system privileges"
          icon={ShieldCheck}
          color="purple"
        />
        <StatsCard
          title="PHARMACISTS / STAFF"
          value={staffCount}
          subtitle="Operational clinic access"
          icon={Shield}
          color="emerald"
        />
      </div>

      {/* Filter & Search Bar */}
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
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="staff">Staff Members</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Personnel</th>
              <th>Contact Email</th>
              <th>System Role</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading staff registry...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No personnel records found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = currentUser?.id === u._id || currentUser?._id === u._id;
                const isAdmin = u.role === 'admin';
                const initials = u.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: isAdmin
                              ? 'rgba(124, 58, 237, 0.1)'
                              : 'var(--primary-light)',
                            border: `1px solid ${isAdmin ? 'rgba(124, 58, 237, 0.25)' : 'var(--primary-border)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: isAdmin ? '#7C3AED' : 'var(--primary)'
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                            {isSelf && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  fontWeight: 600,
                                  textTransform: 'uppercase'
                                }}
                              >
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ID: {u._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Mail size={14} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: isAdmin ? 'rgba(124, 58, 237, 0.08)' : 'var(--primary-light)',
                          color: isAdmin ? '#7C3AED' : 'var(--primary)',
                          border: `1px solid ${isAdmin ? 'rgba(124, 58, 237, 0.25)' : 'var(--primary-border)'}`,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {isAdmin ? <ShieldCheck size={13} /> : <User size={13} />}
                        {isAdmin ? 'Administrator' : 'Staff / Pharmacist'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <Calendar size={13} />
                        <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                          title="Change user role"
                        >
                          <Edit size={14} />
                          <span>Role</span>
                        </button>
                        <button
                          onClick={() => setDeleteTargetUser(u)}
                          disabled={isSelf}
                          className="btn btn-danger btn-sm"
                          style={{
                            padding: '0.35rem 0.6rem',
                            opacity: isSelf ? 0.4 : 1,
                            cursor: isSelf ? 'not-allowed' : 'pointer'
                          }}
                          title={isSelf ? 'Cannot delete your own account' : 'Remove staff account'}
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
      </div>

      {/* Modal: Add New Staff Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Hospital Staff Member"
      >
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jane Smith / Pharmacist Alex"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="e.g. alex.pharmacy@doseflow.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Temporary Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-select"
              >
                <option value="staff">Staff / Pharmacist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem'
            }}
          >
            <strong>Note on privileges:</strong> Administrators have full rights including removing staff and managing inventory. Staff accounts can view medicines, record sales, and handle restock operations.
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 0 0', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Creating Account...' : 'Register Staff Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Role */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modify Access Role: ${selectedUser?.name}`}
        maxWidth="460px"
      >
        <form onSubmit={handleUpdateRole}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Update permissions and role classification for <strong>{selectedUser?.email}</strong>.
          </p>

          <div className="form-group">
            <label className="form-label">System Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="form-select"
              disabled={currentUser?.id === selectedUser?._id && editRole !== 'admin'}
            >
              <option value="staff">Staff / Pharmacist (Standard Permissions)</option>
              <option value="admin">Administrator (Elevated Permissions)</option>
            </select>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Updating...' : 'Save Role Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Deletion */}
      <Modal
        isOpen={!!deleteTargetUser}
        onClose={() => setDeleteTargetUser(null)}
        title="Revoke Staff Access"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you sure you want to remove <strong>{deleteTargetUser?.name}</strong> ({deleteTargetUser?.email})?
            This will permanently revoke their access to DoseFlow.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => setDeleteTargetUser(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={submitting}
              className="btn btn-danger"
            >
              {submitting ? 'Removing...' : 'Revoke & Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Staff;
