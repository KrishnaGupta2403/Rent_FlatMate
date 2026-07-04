'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/common/ProtectedRoute';

import { ownerService } from '../../../services/ownerService';
import { STATUS_COLORS, ROLES } from '../../../constants';
import BorderGlow from '../../../components/ui/BorderGlow';

export default function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const [listRes, reqRes] = await Promise.all([
          ownerService.getMyListings().catch(() => ({ listings: [] })),
          ownerService.getOwnerInterests().catch(() => ({ interests: [] })),
        ]);

        if (listRes) setListings(listRes.listings || (Array.isArray(listRes) ? listRes : []));
        if (reqRes) setRequests(reqRes.interests || (Array.isArray(reqRes) ? reqRes : []));
      } catch (err) {
        console.error('Error fetching owner data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', marginBottom: '8px', display: 'inline-block' }}>
              🔑 Property Owner Portal
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Owner Dashboard</h1>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/owner/requests" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              📨 Pending Requests ({pendingCount})
            </Link>
            <Link href="/owner/add-listing" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              + Create New Listing
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120F17"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1.0}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            className=""
          >
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>My Properties</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>{listings.length}</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>🏠</div>
            </div>
          </BorderGlow>

          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120F17"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1.0}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            className=""
          >
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Applicants</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{pendingCount}</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>⏳</div>
            </div>
          </BorderGlow>

          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120F17"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1.0}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            className=""
          >
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Applications</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{requests.length}</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>📨</div>
            </div>
          </BorderGlow>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120F17"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1.0}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            className=""
          >
            <Link href="/owner/listings" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '2rem', background: 'rgba(99, 102, 241, 0.15)', padding: '12px', borderRadius: '12px' }}>📋</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Manage Listings</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Edit details, update rent, or mark properties as filled</p>
              </div>
            </Link>
          </BorderGlow>

          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120F17"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1.0}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            className=""
          >
            <Link href="/owner/requests" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '2rem', background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '12px' }}>📬</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Review Applications</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Accept or reject interested tenant applications</p>
              </div>
            </Link>
          </BorderGlow>

          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#120F17"
            borderRadius={28}
            glowRadius={40}
            glowIntensity={1.0}
            coneSpread={25}
            animated={false}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            className=""
          >
            <Link href="/owner/chat" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '2rem', background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px' }}>💬</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Tenant Chat Rooms</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live Socket.IO discussions with accepted candidates</p>
              </div>
            </Link>
          </BorderGlow>
        </div>

        {/* My Properties Preview */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>🏠 My Listed Properties</h2>
            <Link href="/owner/listings" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>View All ({listings.length}) →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading your properties...</div>
          ) : listings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't listed any properties yet.</p>
              <Link href="/owner/add-listing" className="btn-primary">+ Add Your First Listing</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {listings.slice(0, 3).map((l) => (
                <div key={l.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ background: STATUS_COLORS[l.status] || '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {l.status}
                      </span>
                      <strong style={{ color: '#10b981' }}>₹{l.rent?.toLocaleString()}</strong>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>{l.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {l.location || l.city}</p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <Link href={`/owner/edit-listing/${l.id}`} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      ✏️ Edit
                    </Link>
                    <Link href="/owner/requests" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      📬 Applications
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
