'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { listingService } from '../../../../services/listingService';
import { tenantService } from '../../../../services/tenantService';
import { aiService } from '../../../../services/aiService';
import CompatibilityBadge from '../../../../components/ai/CompatibilityBadge';
import { useAuth } from '../../../../context/AuthContext';
import { STATUS_COLORS, ROLES } from '../../../../constants';

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interestMsg, setInterestMsg] = useState('');
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const res = await listingService.getListingById(id);
        if (res && res.listing) {
          setListing(res.listing);
        } else {
          setListing(res);
        }

        if (user && user.role === ROLES.TENANT) {
          aiService.getCompatibility(id).then(comp => {
            if (comp) setCompatibility(comp);
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to fetch listing detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, user]);

  const handleSendInterest = async (e) => {
    e.preventDefault();
    if (!user || user.role !== ROLES.TENANT) {
      router.push('/auth/login');
      return;
    }
    setError(null);
    setSendingInterest(true);
    try {
      await tenantService.sendInterest(id, interestMsg);
      setInterestSent(true);
    } catch (err) {
      setError(err.error || err.message || 'Failed to send interest request. You may have already applied.');
    } finally {
      setSendingInterest(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Loading property details...</div>;
  }

  if (!listing) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Property listing not found or removed.</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <button onClick={() => router.back()} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        ← Back to Listings
      </button>

      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <span style={{ 
              background: STATUS_COLORS[listing.status] || '#3b82f6', 
              color: 'white', 
              padding: '6px 14px', 
              borderRadius: '9999px', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              textTransform: 'uppercase' 
            }}>
              {listing.status}
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '12px' }}>{listing.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>📍 {listing.location || listing.city}</p>
          </div>

          <div style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '16px 24px', borderRadius: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly Rent</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981' }}>₹{listing.rent?.toLocaleString()}</div>
          </div>
        </div>

        {/* Photo Gallery */}
        {listing.images && listing.images.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>📸 Property Photos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {listing.images.map((img, idx) => (
                <div key={idx} style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <img src={img.imageUrl?.startsWith('http') ? img.imageUrl : `http://127.0.0.1:5000${img.imageUrl}`} alt={`Property photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                </div>
              ))}
            </div>
          </div>
        )}

        {compatibility && (
          <div style={{ marginBottom: '28px' }}>
            <CompatibilityBadge score={compatibility.score} explanation={compatibility.explanation} generatedBy={compatibility.generatedBy} />
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '24px 0', margin: '24px 0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>About this Home & Flatmate Setup</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.02rem', whiteSpace: 'pre-line' }}>
            {listing.description || 'No detailed description provided by property owner.'}
          </p>
        </div>

        {/* Action Panel for Tenants */}
        {user && user.role === ROLES.TENANT ? (
          <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>📨 Interested in Living Here?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Send an interest request directly to the property owner. Once accepted, real-time chat unlocks!
            </p>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {interestSent ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: '#6ee7b7', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: 600 }}>
                ✅ Your interest request has been sent to the owner! Track status in your Dashboard.
              </div>
            ) : (
              <form onSubmit={handleSendInterest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  rows={3}
                  placeholder="Introduce yourself! Share your lifestyle, profession, or move-in timeline..."
                  value={interestMsg}
                  onChange={(e) => setInterestMsg(e.target.value)}
                  style={{ background: 'var(--bg-secondary)' }}
                />
                <button type="submit" disabled={sendingInterest} className="btn-primary" style={{ padding: '14px', fontSize: '1rem', alignSelf: 'flex-start' }}>
                  {sendingInterest ? 'Sending Request...' : '🚀 Send Interest Request'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            {!user ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                Please <a href="/auth/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>login as a tenant</a> to apply or view AI compatibility.
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>You are viewing this listing as an {user.role}.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
