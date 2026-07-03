import React from 'react';

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        border: '4px solid rgba(99, 102, 241, 0.2)', 
        borderTopColor: '#6366f1', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading AI Compatibility Engine...</p>
    </div>
  );
}
