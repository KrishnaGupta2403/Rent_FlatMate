'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { ownerService } from '../../../services/ownerService';
import { STATUS_COLORS, ROLES } from '../../../constants';

export default function OwnerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await ownerService.getOwnerInterests(params);
      if (res && res.interests) {
        setRequests(res.interests);
      } else if (Array.isArray(res)) {
        setRequests(res);
      }
    } catch (err) {
      console.error('Error fetching owner requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await ownerService.acceptInterest(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r));
    } catch (err) {
      console.error('Failed to accept interest:', err);
      alert('Error: ' + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this tenant application?')) return;
    setActionLoading(id);
    try {
      await ownerService.rejectInterest(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    } catch (err) {
      console.error('Failed to reject interest:', err);
      alert('Error: ' + (err.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '6px' }}>📬 Tenant Interest Applications</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Review candidates applying for your properties. Accepting an application creates a live chat room!</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '6px', borderRadius: '12px' }}>
            {['PENDING', 'ACCEPTED', 'REJECTED', ''].map((st) => (
              <button
                key={st || 'ALL'}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: filterStatus === st ? 'var(--accent-primary)' : 'transparent',
                  color: filterStatus === st ? 'white' : 'var(--text-secondary)'
                }}
              >
                {st || 'ALL'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading applications...</div>
        ) : requests.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Applications Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No tenant applications match the "{filterStatus || 'ALL'}" status filter.</p>
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
                      Applied on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Property: {req.listing?.title || `Listing #${req.listingId?.slice(0, 8)}`}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Applicant Tenant: <strong style={{ color: 'var(--text-primary)' }}>{req.tenant?.email || `User #${req.tenantId?.slice(0, 8)}`}</strong>
                  </p>
                  {req.message && (
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '10px', fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-primary)' }}>
                      "{req.message}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {req.status === 'PENDING' ? (
                    <>
                      <button 
                        onClick={() => handleAccept(req.id)} 
                        disabled={actionLoading === req.id}
                        className="btn-primary" 
                        style={{ padding: '10px 20px', fontSize: '0.85rem', background: '#10b981' }}
                      >
                        {actionLoading === req.id ? 'Processing...' : '✅ Accept Application'}
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)} 
                        disabled={actionLoading === req.id}
                        className="btn-secondary" 
                        style={{ padding: '10px 18px', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      >
                        ❌ Reject
                      </button>
                    </>
                  ) : req.status === 'ACCEPTED' ? (
                    <Link href="/owner/chat" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                      💬 Open Tenant Chat Room
                    </Link>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Application Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
