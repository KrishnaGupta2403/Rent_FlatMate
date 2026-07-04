'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/common/ProtectedRoute';
import { ownerService } from '../../../../services/ownerService';
import { listingService } from '../../../../services/listingService';
import { ROLES, CITIES } from '../../../../constants';

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [existingImages, setExistingImages] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [roomType, setRoomType] = useState('Single');
  const [furnishing, setFurnishing] = useState('Semi-Furnished');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const res = await listingService.getListingById(id);
        const l = res?.listing || res;
        if (l) {
          setTitle(l.title || '');
          setDescription(l.description || '');
          setRent(l.rent || '');
          setCity(l.city || 'Mumbai');
          setLocation(l.location || l.city || '');
          setStatus(l.status || 'ACTIVE');
          setExistingImages(l.images || []);
          setRoomType(l.roomType || 'Single');
          setFurnishing(l.furnishingStatus || 'Semi-Furnished');
          if (l.availableFrom) {
            setAvailableFrom(new Date(l.availableFrom).toISOString().split('T')[0]);
          } else {
            setAvailableFrom(new Date().toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load listing for edit:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (newPhotos.length + selectedFiles.length > 5) {
      alert('You can upload a maximum of 5 new photos in total.');
      return;
    }
    const updatedPhotos = [...newPhotos, ...selectedFiles];
    setNewPhotos(updatedPhotos);
    const previews = updatedPhotos.map(file => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index) => {
    const updatedPhotos = newPhotos.filter((_, idx) => idx !== index);
    setNewPhotos(updatedPhotos);
    if (photoPreviews[index]) {
      URL.revokeObjectURL(photoPreviews[index]);
    }
    const previews = photoPreviews.filter((_, idx) => idx !== index);
    setPhotoPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await ownerService.updateListing(id, {
        title,
        description,
        rent: parseFloat(rent),
        city,
        location: location || city,
        status,
        availableFrom,
        roomType,
        furnishing,
      });

      if (newPhotos.length > 0) {
        const formData = new FormData();
        newPhotos.forEach((file) => {
          formData.append('photos', file);
        });
        await ownerService.uploadPhotos(id, formData);
      }

      router.push('/owner/listings');
    } catch (err) {
      setError(err.error || err.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
      <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>✏️ Edit Property Listing</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
          Modify your property specifications, update rental status, or upload more photos below.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading property data...</div>
        ) : (
          <div className="glass-panel" style={{ padding: '36px' }}>
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Listing Status
                </label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ background: 'var(--bg-secondary)', fontWeight: 600 }}>
                  <option value="ACTIVE">ACTIVE (Visible to Tenants & AI)</option>
                  <option value="FILLED">FILLED (Room Taken)</option>
                  <option value="HIDDEN">HIDDEN (Temporarily Unlisted)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Available From *
                  </label>
                  <input
                    type="date"
                    required
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    style={{ background: 'var(--bg-secondary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Room Type *
                  </label>
                  <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ background: 'var(--bg-secondary)' }}>
                    <option value="Single">Single Room</option>
                    <option value="Shared">Shared Room</option>
                    <option value="Entire Apartment">Entire Apartment</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Furnishing *
                  </label>
                  <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)} style={{ background: 'var(--bg-secondary)' }}>
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Existing Images Display */}
              {existingImages && existingImages.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Existing Uploaded Photos
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {existingImages.map((img, idx) => (
                      <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={`http://localhost:5000${img.imageUrl}`} alt="Existing property photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Additional Photos */}
              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  📸 Add New Photos <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Max 5 images)</span>
                </label>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Select JPG or PNG files to upload and attach to this property.
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
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            zIndex: 10
                          }}
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Detailed Description & Rules *
                </label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ background: 'var(--bg-secondary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1rem', fontWeight: 700 }}>
                  {saving ? 'Saving Changes...' : '💾 Save Changes & Upload Photos'}
                </button>
                <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ padding: '14px 24px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
