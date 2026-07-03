'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants';
import Lightfall from '../../../components/ui/Lightfall';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.TENANT);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const newUser = await register({ fullName, email, phone, password, role });
      if (newUser && newUser.role === ROLES.ADMIN) {
        router.push('/admin/dashboard');
      } else if (newUser && newUser.role === ROLES.OWNER) {
        router.push('/owner/dashboard');
      } else {
        router.push('/tenant/dashboard');
      }
    } catch (err) {
      setError(err.error || err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <Lightfall
         colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={1}
          streakCount={2}
          streakWidth={0.2}
          streakLength={1}
          glow={1.6}
          density={1}
          twinkle={1}
          zoom={1.8}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.6}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <div className="glass-panel" style={{ 
          width: '100%', 
          maxWidth: '480px', 
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
          backgroundColor: 'rgba(10, 8, 24, 0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 0 rgba(255, 255, 255, 0.05)',
          borderRadius: '24px'
        }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
            Join RentFlatmate AI ✨
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.92rem', marginBottom: '28px' }}>
            Select your role to start discovering AI-matched homes or tenants.
          </p>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Account Role *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setRole(ROLES.TENANT)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: `2px solid ${role === ROLES.TENANT ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: role === ROLES.TENANT ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: role === ROLES.TENANT ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  🏠 Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setRole(ROLES.OWNER)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: `2px solid ${role === ROLES.OWNER ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: role === ROLES.OWNER ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: role === ROLES.OWNER ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  🔑 Owner
                </button>
                <button
                  type="button"
                  onClick={() => setRole(ROLES.ADMIN)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: `2px solid ${role === ROLES.ADMIN ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: role === ROLES.ADMIN ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: role === ROLES.ADMIN ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Krishna Gupta"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Phone Number <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Create Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '12px', width: '100%', padding: '14px', fontSize: '1.02rem', fontWeight: 700 }}>
              {loading ? 'Creating Account...' : 'Get Started Now →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
