'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { ownerService } from '../../../services/ownerService';
import { ROLES, CITIES } from '../../../constants';

export default function AddListingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('You can upload a maximum of 5 photos.');
      return;
    }
    setPhotos(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await ownerService.createListing({
        title,
        description,
        rent: parseFloat(rent),
        city,
        location: location || city,
      });

      const listingId = res?.listing?.id || res?.id;

      // If photos were selected, upload them to the backend
      if (photos.length > 0 && listingId) {
        const formData = new FormData();
        photos.forEach((file) => {
          formData.append('photos', file);
        });
        await ownerService.uploadPhotos(listingId, formData);
      }

      router.push('/owner/listings');
    } catch (err) {
      setError(err.error || err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
      <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>+ Create New Property Listing</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
          Add your property details and upload photos below. Once listed, our AI Compatibility Engine will begin matching tenants!
        </p>

        <div className="glass-panel" style={{ padding: '36px' }}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Listing Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Spacious Master Bedroom in Bandra West with Balcony"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  City *
                </label>
                <select value={city} onChange={(e) => setCity(e.target.value)} style={{ background: 'var(--bg-secondary)' }}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Specific Area / Neighborhood *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bandra West, Near Pali Hill"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Photo Upload Section */}
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                📸 Upload Property Photos <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Max 5 images)</span>
              </label>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Clear photos increase AI matchmaking interest by 3x! Select JPG or PNG files.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ background: 'transparent', border: 'none', padding: '0', color: 'var(--text-primary)', cursor: 'pointer' }}
              />

              {photoPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {photoPreviews.map((src, idx) => (
                    <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--accent-primary)', position: 'relative' }}>
                      <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Detailed Description & Flatmate Rules *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe the house amenities, WiFi, maid services, society guidelines, or preferred flatmate habits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ background: 'var(--bg-secondary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1rem', fontWeight: 700 }}>
                {loading ? 'Publishing & Uploading Photos...' : '✨ Publish Property Listing'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ padding: '14px 24px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
