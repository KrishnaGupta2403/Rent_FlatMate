'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import ListingCard from '../../../components/cards/ListingCard';
import { tenantService } from '../../../services/tenantService';
import { ROLES } from '../../../constants';

export default function TenantFavouritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await tenantService.getFavorites();
      const list = res?.favorites || (Array.isArray(res) ? res : []);
      setFavorites(list);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFav = (listingId, isFav) => {
    if (!isFav) {
      setFavorites(prev => prev.filter(item => (item.id || item.listingId) !== listingId));
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
      <div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '8px' }}>⭐ My Saved Favourites</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Review properties you bookmarked for later comparison and AI matching.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading bookmarked homes...</div>
        ) : favorites.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤍</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Favourites Saved</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Click the heart icon on any listing card to save it here for quick access!
            </p>
            <a href="/tenant/listings" className="btn-primary">Browse Properties →</a>
          </div>
        ) : (
          <div className="grid-cards">
            {favorites.map((fav) => {
              const listingObj = fav.listing || fav;
              return (
                <ListingCard
                  key={listingObj.id}
                  listing={listingObj}
                  isFavoriteInitial={true}
                  onFavoriteToggle={handleToggleFav}
                />
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
