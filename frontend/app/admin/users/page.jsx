'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { adminService } from '../../../services/adminService';
import { ROLES } from '../../../constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const res = await adminService.listUsers(params);
      if (res && res.users) {
        setUsers(res.users);
      } else if (Array.isArray(res)) {
        setUsers(res);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleBlock = async (user) => {
    const isBlocking = user.isActive;
    const actionText = isBlocking ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${actionText} user ${user.email}?`)) return;

    setActionLoading(user.id);
    try {
      if (isBlocking) {
        await adminService.blockUser(user.id);
      } else {
        await adminService.unblockUser(user.id);
      }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !isBlocking } : u));
    } catch (err) {
      console.error(`Failed to ${actionText} user:`, err);
      alert(`Error: ` + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete account ${user.email}? This action cannot be undone.`)) return;
    setActionLoading(user.id);
    try {
      await adminService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Error: ' + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '6px' }}>👥 User Account Moderation</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage accounts, block bad actors, or filter by role. Blocked users lose access on their next API request!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '6px', borderRadius: '12px' }}>
            {['', 'TENANT', 'OWNER', 'ADMIN'].map((r) => (
              <button
                key={r || 'ALL'}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: roleFilter === r ? 'var(--accent-primary)' : 'transparent',
                  color: roleFilter === r ? 'white' : 'var(--text-secondary)'
                }}
              >
                {r || 'ALL USERS'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading user directory...</div>
        ) : users.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No users match the selected role filter.
          </div>
        ) : (
          <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 16px' }}>Email Address</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Joined Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition)' }}>
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'OWNER' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: u.role === 'ADMIN' ? '#f87171' : u.role === 'OWNER' ? '#fbbf24' : '#60a5fa',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        color: u.isActive ? '#10b981' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.isActive ? '#10b981' : '#ef4444', display: 'inline-block' }}></span>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleBlock(u)}
                            disabled={actionLoading === u.id}
                            className={u.isActive ? 'btn-secondary' : 'btn-primary'}
                            style={{ 
                              padding: '6px 14px', 
                              fontSize: '0.8rem', 
                              borderColor: u.isActive ? 'var(--warning)' : undefined,
                              color: u.isActive ? 'var(--warning)' : undefined,
                              background: !u.isActive ? '#10b981' : undefined
                            }}
                          >
                            {actionLoading === u.id ? '...' : u.isActive ? '🚫 Block' : '✅ Unblock'}
                          </button>
                        )}
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={actionLoading === u.id}
                            className="btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
