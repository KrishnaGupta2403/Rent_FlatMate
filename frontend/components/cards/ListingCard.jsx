'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { tenantService } from '../../services/tenantService';
import { aiService } from '../../services/aiService';
import CompatibilityBadge from '../ai/CompatibilityBadge';
import { STATUS_COLORS, ROLES } from '../../constants';
import BorderGlow from '../ui/BorderGlow';

export default function ListingCard({ listing, onFavoriteToggle, isFavoriteInitial = false }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [loadingFav, setLoadingFav] = useState(false);
  const [compatibility, setCompatibility] = useState(listing.compatibility || null);
  const [loadingAi, setLoadingAi] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!user || user.role !== ROLES.TENANT) return;
    setLoadingFav(true);
    try {
      if (isFavorite) {
        await tenantService.removeFavorite(listing.id);
        setIsFavorite(false);
      } else {
        await tenantService.addFavorite(listing.id);
        setIsFavorite(true);
      }
      if (onFavoriteToggle) onFavoriteToggle(listing.id, !isFavorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setLoadingFav(false);
    }
  };

  const fetchCompatibility = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoadingAi(true);
    try {
      const res = await aiService.getCompatibility(listing.id);
      if (res) {
        setCompatibility(res.compatibility || res);
      }
    } catch (err) {
      console.error('Failed to calculate AI compatibility:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const primaryImg = listing.images?.find(i => i.isPrimary)?.imageUrl || listing.images?.[0]?.imageUrl;

  return (
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
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <div>
          {primaryImg && (
            <div style={{ height: '180px', margin: '-20px -20px 16px -20px', overflow: 'hidden', borderRadius: '28px 28px 0 0', position: 'relative' }}>
              <img 
                src={primaryImg.startsWith('http') ? primaryImg : `http://127.0.0.1:5000${primaryImg}`} 
                alt={listing.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => e.target.style.display = 'none'} 
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ 
              background: STATUS_COLORS[listing.status] || '#3b82f6', 
              color: 'white', 
              padding: '4px 10px', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              textTransform: 'uppercase' 
            }}>
              {listing.status}
            </span>

            {user && user.role === ROLES.TENANT && (
              <button 
                onClick={toggleFavorite} 
                disabled={loadingFav}
                style={{ fontSize: '1.3rem', background: 'rgba(255,255,255,0.08)', padding: '6px 10px', borderRadius: '50%' }}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            {listing.title}
          </h3>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {listing.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Rent</span>
              <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1.05rem' }}>₹{listing.rent?.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Location</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{listing.location || listing.city}</div>
            </div>
          </div>

          {compatibility ? (
            <CompatibilityBadge score={compatibility.score} explanation={compatibility.explanation} generatedBy={compatibility.generatedBy} />
          ) : (
            user && (
              <button 
                onClick={fetchCompatibility} 
                disabled={loadingAi}
                className="btn-secondary" 
                style={{ width: '100%', padding: '8px', fontSize: '0.82rem', marginBottom: '10px', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
              >
                {loadingAi ? '🤖 Analyzing compatibility...' : '✨ Calculate AI Match Score'}
              </button>
            )
          )}
        </div>

        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            By {listing.owner?.email?.split('@')[0] || 'Owner'}
          </span>
          
          <Link href={`/tenant/listings/${listing.id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            View Details →
          </Link>
        </div>
      </div>
    </BorderGlow>
  );
}
