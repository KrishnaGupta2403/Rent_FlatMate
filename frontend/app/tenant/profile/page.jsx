'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { tenantService } from '../../../services/tenantService';
import { ROLES, CITIES } from '../../../constants';

export default function TenantProfilePage() {
  const [maxBudget, setMaxBudget] = useState(30000);
  const [preferredCity, setPreferredCity] = useState('Mumbai');
  const [lifestyle, setLifestyle] = useState('Non-smoker, quiet, professional');
  const [moveInDate, setMoveInDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await tenantService.getPreferences();
        if (res && res.preferences) {
          setMaxBudget(res.preferences.maxBudget || 30000);
          setPreferredCity(res.preferences.preferredCity || 'Mumbai');
          setLifestyle(res.preferences.lifestyle || '');
          if (res.preferences.moveInDate) {
            setMoveInDate(res.preferences.moveInDate.split('T')[0]);
          }
        }
      } catch (e) {
        console.log('No existing preferences found, creating new on save.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await tenantService.updatePreferences({
        maxBudget: parseInt(maxBudget, 10),
        preferredCity,
        lifestyle,
        moveInDate: moveInDate || new Date().toISOString(),
      });
      setMsg('Preferences saved successfully! AI Compatibility Engine updated.');
    } catch (e) {
      setErr(e.error || e.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>⚙️ My Matchmaking Preferences</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
          Our AI uses these exact parameters to score compatibility with property listings!
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading preferences...</div>
        ) : (
          <div className="glass-panel" style={{ padding: '36px' }}>
            {msg && <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: '#6ee7b7', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>✅ {msg}</div>}
            {err && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>❌ {err}</div>}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Max Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  required
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Preferred City
                </label>
                <select value={preferredCity} onChange={(e) => setPreferredCity(e.target.value)} style={{ background: 'var(--bg-secondary)' }}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Lifestyle & Habits (For AI Evaluation)
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Early riser, non-smoker, vegetarian, works in tech, enjoys quiet evenings..."
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  style={{ background: 'var(--bg-secondary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Target Move-in Date
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '10px' }}>
                {saving ? 'Saving...' : '✨ Save & Update AI Match Engine'}
              </button>
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
