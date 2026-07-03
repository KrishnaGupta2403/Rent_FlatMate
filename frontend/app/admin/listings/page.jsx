'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { adminService } from '../../../services/adminService';
import { STATUS_COLORS, ROLES } from '../../../constants';

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await adminService.listListings();
      if (res && res.listings) {
        setListings(res.listings);
      } else if (Array.isArray(res)) {
        setListings(res);
      }
    } catch (err) {
      console.error('Error fetching listings for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleMarkSpam = async (id) => {
    if (!window.confirm('Mark this listing as SPAM? It will be hidden from public search.')) return;
    setActionLoading(id);
    try {
      await adminService.markSpam(id);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'HIDDEN', title: `[SPAM] ${l.title}` } : l));
    } catch (err) {
      console.error('Failed to mark spam:', err);
      alert('Error: ' + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this property listing?')) return;
    setActionLoading(id);
    try {
      await adminService.deleteListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert('Error: ' + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '6px' }}>📋 Listing Moderation & Spam Control</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review platform properties, flag spam advertisements, or remove violating posts.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading platform listings...</div>
        ) : listings.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No listings found on the platform.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {listings.map((l) => (
              <div key={l.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: STATUS_COLORS[l.status] || '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {l.status}
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>₹{l.rent?.toLocaleString()}</strong>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {l.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    📍 {l.location || l.city} • Owner: <strong style={{ color: 'var(--text-primary)' }}>{l.owner?.email || 'Unknown'}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {l.description}
                  </p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Added {new Date(l.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleMarkSpam(l.id)}
                      disabled={actionLoading === l.id || l.status === 'HIDDEN'}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: 'var(--warning)', color: 'var(--warning)' }}
                    >
                      {actionLoading === l.id ? '...' : '⚠️ Mark Spam'}
                    </button>
                    <button
                      onClick={() => handleDelete(l.id)}
                      disabled={actionLoading === l.id}
                      className="btn-danger"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
