'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { adminService } from '../../../services/adminService';
import { aiService } from '../../../services/aiService';
import { ROLES } from '../../../constants';
import BorderGlow from '../../../components/ui/BorderGlow';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testingAi, setTestingAi] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res?.stats || res || {});
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleTestToggleFail = async () => {
    setTestingAi(true);
    setTestResult(null);
    try {
      const res = await aiService.testToggleFail();
      setTestResult(res);
    } catch (err) {
      setTestResult({ error: err.error || err.message });
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', marginBottom: '8px', display: 'inline-block' }}>
              🛡️ System Administration
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Admin Dashboard</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/admin/users" className="btn-secondary">👥 Manage Users</Link>
            <Link href="/admin/listings" className="btn-secondary">📋 Moderate Listings</Link>
            <Link href="/admin/analytics" className="btn-primary">📈 Analytics & AI Engine</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading system metrics...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
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
              <div style={{ padding: '24px', width: '100%' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Users</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                  {stats?.totalUsers || stats?.usersCount || 0}
                </div>
              </div>
            </BorderGlow>

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
              <div style={{ padding: '24px', width: '100%' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Tenants</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>
                  {stats?.tenantsCount || stats?.activeTenants || 0}
                </div>
              </div>
            </BorderGlow>

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
              <div style={{ padding: '24px', width: '100%' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Property Owners</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                  {stats?.ownersCount || stats?.activeOwners || 0}
                </div>
              </div>
            </BorderGlow>

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
              <div style={{ padding: '24px', width: '100%' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Listings</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
                  {stats?.totalListings || stats?.listingsCount || 0}
                </div>
              </div>
            </BorderGlow>
          </div>
        )}

        {/* AI Engine & Fallback Simulation Tool */}
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', borderLeft: '4px solid var(--accent-primary)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>🤖 AI Engine Diagnostic & Circuit Breaker</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Test the AI compatibility engine's fallback mechanism. When triggered, the system simulates a primary Gemini API failure and automatically fails over to our rule-based compatibility evaluation algorithm without downtime!
          </p>

          <button onClick={handleTestToggleFail} disabled={testingAi} className="btn-primary" style={{ padding: '12px 24px' }}>
            {testingAi ? 'Simulating Failure & Testing Failover...' : '⚡ Toggle AI Circuit Breaker (Simulate API Failover)'}
          </button>

          {testResult && (
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
              <strong style={{ color: testResult.error ? '#f87171' : '#34d399' }}>
                {testResult.error ? '❌ Simulation Error:' : '✅ Circuit Breaker Status Response:'}
              </strong>
              <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Quick Admin Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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
            <Link href="/admin/users" style={{ padding: '24px', display: 'block', width: '100%' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>👥 User Moderation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Block abusive accounts, unblock users, or remove accounts. Blocked users lose token access instantly.
              </p>
            </Link>
          </BorderGlow>

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
            <Link href="/admin/listings" style={{ padding: '24px', display: 'block', width: '100%' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>📋 Listing Moderation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Mark spam properties, remove scam listings, and maintain housing quality across the platform.
              </p>
            </Link>
          </BorderGlow>

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
            <Link href="/admin/analytics" style={{ padding: '24px', display: 'block', width: '100%' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>📊 System Analytics</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Monitor real-time Socket.IO connections, API response latencies, and match conversion rates.
              </p>
            </Link>
          </BorderGlow>
        </div>
      </div>
    </ProtectedRoute>
  );
}
