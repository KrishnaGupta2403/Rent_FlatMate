'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');
  if (isAuthPage) return null;

  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 0', background: 'var(--bg-secondary)', marginTop: '80px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>✨ RentFlatmate AI</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '320px', fontSize: '0.9rem' }}>
            Next-generation AI compatibility matching & real-time Socket.IO communication for tenants and property owners.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Platform</strong>
            <Link href="/tenant/listings" style={{ color: 'var(--text-secondary)' }}>Browse Listings</Link>
            <Link href="/auth/login" style={{ color: 'var(--text-secondary)' }}>Tenant Portal</Link>
            <Link href="/auth/login" style={{ color: 'var(--text-secondary)' }}>Owner Dashboard</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>AI Tech</strong>
            <span style={{ color: 'var(--text-secondary)' }}>Compatibility Engine</span>
            <span style={{ color: 'var(--text-secondary)' }}>Socket.IO Real-time</span>
            <span style={{ color: 'var(--text-secondary)' }}>Prisma ORM & PostgreSQL</span>
          </div>
        </div>
      </div>
      <div className="container" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} RentFlatmate AI. Enterprise Grade Architecture. All rights reserved.
      </div>
    </footer>
  );
}
