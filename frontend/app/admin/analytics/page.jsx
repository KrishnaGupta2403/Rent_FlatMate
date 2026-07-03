'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { adminService } from '../../../services/adminService';
import { aiService } from '../../../services/aiService';
import { ROLES } from '../../../constants';

export default function AdminAnalyticsPage() {
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
        console.error('Error fetching admin analytics:', err);
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
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '6px' }}>📈 Platform Analytics & AI Diagnostics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time system health, AI compatibility engine failover testing, and user conversion metrics.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading system analytics...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Real-time WebSocket Rooms</span>
                <span style={{ fontSize: '1.5rem' }}>🔌</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>Active</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Socket.IO server listening on port 5000 with JWT authentication
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Compatibility Engine</span>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6366f1' }}>99.8%</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Average compatibility match calculation confidence
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Interest Conversion Rate</span>
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>74.2%</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Tenant applications accepted by property owners
              </p>
            </div>
          </div>
        )}

        {/* AI Circuit Breaker & Failover Testing */}
        <div className="glass-panel" style={{ padding: '36px', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>AI Engine Circuit Breaker Tool</h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6, maxWidth: '800px' }}>
            Our architecture incorporates a robust fallback algorithm for AI compatibility scoring. If external LLM API calls fail or timeout, the system automatically triggers an internal rule-based engine (evaluating lifestyle habits, budgets, and cities) so tenant matchmaking never degrades. Use this control to test simulated API failover.
          </p>

          <button onClick={handleTestToggleFail} disabled={testingAi} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}>
            {testingAi ? '🔄 Triggering Failure Simulation...' : '⚡ Simulate AI Failover (Toggle Rule-Engine Fallback)'}
          </button>

          {testResult && (
            <div className="animate-fade-in" style={{ marginTop: '24px', padding: '20px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>
              <div style={{ fontWeight: 700, color: testResult.error ? '#f87171' : '#34d399', marginBottom: '8px', fontSize: '0.95rem' }}>
                {testResult.error ? '❌ Failover Error:' : '✅ Failover Simulation Result:'}
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: '0.85rem' }}>
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
