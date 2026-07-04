'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/common/ProtectedRoute';

import { tenantService } from '../../../services/tenantService';
import { listingService } from '../../../services/listingService';
import ListingCard from '../../../components/cards/ListingCard';
import { ROLES } from '../../../constants';
import BorderGlow from '../../../components/ui/BorderGlow';

export default function TenantDashboard() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [favsRes, reqsRes, listingsRes] = await Promise.all([
          tenantService.getFavorites().catch(() => ({ favorites: [] })),
          tenantService.getTenantInterests().catch(() => ({ interests: [] })),
          listingService.getPublicListings({ limit: 3 }).catch(() => ({ listings: [] })),
        ]);

        if (favsRes) setFavoritesCount(favsRes.favorites?.length || (Array.isArray(favsRes) ? favsRes.length : 0));
        if (reqsRes) setRequestsCount(reqsRes.interests?.length || (Array.isArray(reqsRes) ? reqsRes.length : 0));
        if (listingsRes) setRecentListings(listingsRes.listings || (Array.isArray(listingsRes) ? listingsRes : []));
      } catch (err) {
        console.error('Error fetching tenant dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', marginBottom: '8px', display: 'inline-block' }}>
              🏠 Tenant Portal
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>My Dashboard</h1>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/tenant/profile" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              ⚙️ My Preferences
            </Link>
            <Link href="/tenant/listings" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              🔍 Browse Listings
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
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saved Favorites</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{favoritesCount}</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>❤️</div>
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
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Interests</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{requestsCount}</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>📩</div>
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
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Match Engine</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6', marginTop: '8px' }}>Active & Ready</div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>✨</div>
            </div>
          </BorderGlow>
        </div>

        {/* Navigation Quick Links */}
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
            <Link href="/tenant/requests" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '2rem', background: 'rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '12px' }}>📨</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Interest Requests</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track pending, accepted, or rejected applications</p>
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
            <Link href="/tenant/chat" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '2rem', background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px' }}>💬</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Real-time Messages</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chat over Socket.IO with accepted property owners</p>
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
            <Link href="/tenant/favourites" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '2rem', background: 'rgba(236, 72, 153, 0.15)', padding: '12px', borderRadius: '12px' }}>⭐</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>My Favourites</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review homes you saved for future reference</p>
              </div>
            </Link>
          </BorderGlow>
        </div>

        {/* Recommended Homes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>🏠 Recommended For You</h2>
            <Link href="/tenant/listings" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Explore All →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading recommendations...</div>
          ) : recentListings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No recommended homes available yet.</div>
          ) : (
            <div className="grid-cards">
              {recentListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
