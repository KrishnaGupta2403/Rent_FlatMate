'use client';
import React from 'react';

export default function CompatibilityBadge({ score, explanation, generatedBy }) {
  if (score === undefined || score === null) return null;

  const getGradient = (val) => {
    if (val >= 80) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (val >= 60) return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    if (val >= 40) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '12px',
      padding: '12px',
      marginTop: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
          ✨ AI Match Score
        </span>
        <span style={{
          background: getGradient(score),
          color: 'white',
          padding: '2px 10px',
          borderRadius: '9999px',
          fontWeight: 800,
          fontSize: '0.9rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {score}%
        </span>
      </div>
      
      {explanation && (
        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4', fontStyle: 'italic' }}>
          "{explanation}"
        </p>
      )}

      {generatedBy && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
            Engine: {generatedBy}
          </span>
        </div>
      )}
    </div>
  );
}
