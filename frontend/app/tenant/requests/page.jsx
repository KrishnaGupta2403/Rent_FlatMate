'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { tenantService } from '../../../services/tenantService';
import { STATUS_COLORS, ROLES } from '../../../constants';

export default function TenantRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await tenantService.getTenantInterests();
      if (res && res.interests) {
        setRequests(res.interests);
      } else if (Array.isArray(res)) {
        setRequests(res);
      }
    } catch (err) {
      console.error('Error fetching interest requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this interest request?')) return;
    try {
      await tenantService.cancelInterest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to cancel request:', err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
      <div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '8px' }}>📨 My Interest Applications</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Track the status of your applications. When an owner accepts your request, chat access is unlocked!
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading your applications...</div>
        ) : requests.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Applications Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You haven't sent interest requests for any properties yet.</p>
            <Link href="/tenant/listings" className="btn-primary">Explore Homes Now →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((req) => (
              <div key={req.id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ 
                      background: STATUS_COLORS[req.status] || '#f59e0b', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700 
                    }}>
                      {req.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Applied {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {req.listing?.title || `Listing #${req.listingId?.slice(0, 8)}`}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    {req.listing?.location || req.listing?.city || 'Verified Location'} • <strong style={{ color: '#10b981' }}>₹{req.listing?.rent?.toLocaleString()}</strong>
                  </p>
                  {req.message && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                      Your Note: "{req.message}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {req.status === 'ACCEPTED' ? (
                    <Link href="/tenant/chat" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                      💬 Open Real-time Chat
                    </Link>
                  ) : req.status === 'PENDING' && (
                    <button onClick={() => handleCancel(req.id)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                      Cancel Request
                    </button>
                  )}
                  <Link href={`/tenant/listings/${req.listingId}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    View Listing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
