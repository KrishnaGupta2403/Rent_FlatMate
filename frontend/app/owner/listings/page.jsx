'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { ownerService } from '../../../services/ownerService';
import { STATUS_COLORS, ROLES } from '../../../constants';

export default function OwnerListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await ownerService.getMyListings();
      if (res && res.listings) {
        setListings(res.listings);
      } else if (Array.isArray(res)) {
        setListings(res);
      }
    } catch (err) {
      console.error('Error fetching owner listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await ownerService.deleteListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert('Could not delete listing: ' + (err.error || err.message));
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '6px' }}>📋 My Listed Properties</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your available rooms, edit rent, or check interest applications.</p>
          </div>
          <Link href="/owner/add-listing" className="btn-primary" style={{ padding: '12px 24px' }}>
            + Create New Listing
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading your properties...</div>
        ) : listings.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏠</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Properties Listed</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You haven't added any properties to our AI matching engine yet.</p>
            <Link href="/owner/add-listing" className="btn-primary">+ Add Your First Property →</Link>
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

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    {l.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    📍 {l.location || l.city}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {l.description}
                  </p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href={`/owner/edit-listing/${l.id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    ✏️ Edit
                  </Link>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href="/owner/requests" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      📬 Applications
                    </Link>
                    <button onClick={() => handleDelete(l.id)} className="btn-danger" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      🗑️
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
