'use client';
import React, { useState, useEffect } from 'react';
import ListingCard from '../../../components/cards/ListingCard';
import { listingService } from '../../../services/listingService';
import { aiService } from '../../../services/aiService';
import { CITIES } from '../../../constants';

export default function TenantListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [aiSort, setAiSort] = useState(false);
  const [topMatchModal, setTopMatchModal] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const fetchListings = async (customParams = {}) => {
    setLoading(true);
    try {
      if (aiSort) {
        const res = await aiService.getSortedListings();
        const list = res?.listings || res?.sortedListings || (Array.isArray(res) ? res : []);
        setListings(list);
        if (list.length > 0) {
          setTopMatchModal(list[0]);
        }
      } else {
        const params = { ...customParams };
        if (searchCity) params.city = searchCity;
        if (maxRent) params.maxRent = maxRent;

        const res = await listingService.getPublicListings(params);
        if (res && res.listings) {
          setListings(res.listings);
        } else if (Array.isArray(res)) {
          setListings(res);
        }
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTopMatch = async () => {
    setLoadingSuggestion(true);
    try {
      setAiSort(true);
      const res = await aiService.getSortedListings();
      const list = res?.listings || res?.sortedListings || (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        setListings(list);
        setTopMatchModal(list[0]);
      } else {
        alert('No properties available for AI matching.');
      }
    } catch (err) {
      console.error('Failed to get AI top match:', err);
      alert('Error fetching AI matching. Please ensure you are logged in!');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [aiSort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAiSort(false);
    fetchListings();
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          Explore Verified Homes 🏠
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Filter by location, budget, or let our AI Compatibility Engine rank properties by your lifestyle fit!
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '36px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              City / Location
            </label>
            <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)} style={{ background: 'var(--bg-secondary)' }}>
              <option value="">All Cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Max Rent (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              style={{ background: 'var(--bg-secondary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
              🔍 Filter
            </button>
            <button
              type="button"
              onClick={() => setAiSort(!aiSort)}
              className={aiSort ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '12px 20px', background: aiSort ? 'var(--accent-gradient)' : undefined }}
            >
              ✨ {aiSort ? 'AI Sorted Active' : 'Sort by AI Match'}
            </button>
            <button
              type="button"
              onClick={handleSuggestTopMatch}
              disabled={loadingSuggestion}
              className="btn-primary"
              style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: 'none', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)' }}
            >
              {loadingSuggestion ? '🤖 Finding Fit...' : '🏆 Suggest #1 AI Match'}
            </button>
          </div>
        </form>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          {aiSort ? '🤖 AI Engine calculates compatibility scores...' : 'Loading homes...'}
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No properties match your exact criteria. Try broadening your filter or clearing search!
        </div>
      ) : (
        <div className="grid-cards">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      {/* AI Top Recommendation Popup Modal */}
      {topMatchModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '32px',
            borderRadius: '24px',
            position: 'relative',
            border: '2px solid #8b5cf6',
            boxShadow: '0 20px 50px rgba(139, 92, 246, 0.4)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setTopMatchModal(null)}
              style={{
                position: 'absolute',
                top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: '36px', height: '36px',
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🏆 #1 Most Compatible For You
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '16px', color: 'var(--text-primary)' }}>
                {topMatchModal.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                📍 {topMatchModal.location || topMatchModal.city}
              </p>
            </div>

            {topMatchModal.images && topMatchModal.images.length > 0 && (
              <div style={{ height: '220px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                <img
                  src={topMatchModal.images[0].imageUrl?.startsWith('http') ? topMatchModal.images[0].imageUrl : `http://127.0.0.1:5000${topMatchModal.images[0].imageUrl}`}
                  alt={topMatchModal.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {topMatchModal.compatibility && (
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8b5cf6', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#c4b5fd' }}>✨ AI Compatibility Score</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{topMatchModal.compatibility.score}% Match</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {topMatchModal.compatibility.explanation}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '14px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Rent</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>₹{topMatchModal.rent?.toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Room Type</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{topMatchModal.roomType || 'Whole Apartment'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={`/tenant/listings/${topMatchModal.id}`}
                className="btn-primary"
                style={{ flex: 1, padding: '14px', textAlign: 'center', fontSize: '1.05rem', fontWeight: 700 }}
              >
                View Full Details & Apply →
              </a>
              <button
                type="button"
                onClick={() => setTopMatchModal(null)}
                className="btn-secondary"
                style={{ padding: '14px 24px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
