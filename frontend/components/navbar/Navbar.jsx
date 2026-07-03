'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ROLES } from '../../constants';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useSocket();
  const pathname = usePathname();

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    if (user.role === ROLES.ADMIN) return '/admin/dashboard';
    if (user.role === ROLES.OWNER) return '/owner/dashboard';
    return '/tenant/dashboard';
  };

  const isAuthPage = pathname?.startsWith('/auth/');
  if (isAuthPage) return null;
  const isLandingPage = pathname === '/';

  return (
    <header className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 100, padding: '16px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ✨ RentFlatmate AI
        </Link>

        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', fontWeight: 500 }}>
          {!isLandingPage && <Link href="/tenant/listings">Explore Listings</Link>}
          {user && (
            <>
              <Link href={getDashboardLink()}>Dashboard</Link>
              {user.role === ROLES.TENANT && <Link href="/tenant/favourites">Favourites</Link>}
              {user.role === ROLES.OWNER && <Link href="/owner/add-listing">+ Add Listing</Link>}
              <Link href={user.role === ROLES.OWNER ? '/owner/chat' : '/tenant/chat'} style={{ position: 'relative' }}>
                💬 Chat
              </Link>
            </>
          )}
        </nav>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hi, <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user.fullName?.split(' ')[0] || user.name?.split(' ')[0] || user.email?.split('@')[0]}</strong> ({user.role})
              </span>
              <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary" style={{ padding: '8px 18px' }}>
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary" style={{ padding: '8px 20px' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
