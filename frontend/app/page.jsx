'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WorldMapDemo from '../components/WorldMapDemo';
import FloatingLines from '../components/ui/FloatingLines';

export default function HomePage() {
  const headingWords = "Find Your Perfect Flatmate with AI Precision".split(" ");

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Top Part with Animated Lines Background */}
      <div style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', width: '100vw', marginTop: '-40px', paddingTop: '40px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.45 }}>
          <FloatingLines 
            linesGradient={['#e84df5', '#a855f7', '#ffffff']}
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={[16, 22, 28]}
            lineDistance={[8, 6, 4]}
            bendRadius={5.0}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
          />
        </div>

        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '80px 20px 40px 20px', maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="badge"
            style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', marginBottom: '24px', display: 'inline-block' }}
          >
            🚀 Next-Generation Housing Matching
          </motion.span>

          <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {headingWords.map((word, idx) => (
              <motion.span
                key={idx}
                initial={{ filter: "blur(12px)", opacity: 0, y: 15 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.08, ease: "easeOut" }}
                style={{
                  display: "inline-block",
                  marginRight: "12px",
                  background: word === "AI" || word === "Precision" ? "linear-gradient(135deg, #d946ef, #a855f7)" : undefined,
                  WebkitBackgroundClip: word === "AI" || word === "Precision" ? "text" : undefined,
                  WebkitTextFillColor: word === "AI" || word === "Precision" ? "transparent" : undefined
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ filter: "blur(8px)", opacity: 0, y: 15 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.65, maxWidth: '780px', marginLeft: 'auto', marginRight: 'auto' }}
          >
            Say goodbye to random roommate search. Our custom AI compatibility engine evaluates lifestyle habits, budgets, and preferences while real-time Socket.IO chat connects you instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/tenant/listings" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.08rem', fontWeight: 700, borderRadius: '14px', boxShadow: '0 8px 24px rgba(217, 70, 239, 0.3)' }}>
              Explore Verified Listings 🔍
            </Link>
            <Link href="/auth/register" className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.08rem', fontWeight: 700, borderRadius: '14px' }}>
              Create Free Profile ✨
            </Link>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', margin: '60px auto', maxWidth: '1200px', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          {[
            { label: 'AI Match Accuracy', val: '98.4%', desc: 'Lifestyle & budget alignment', color: '#d946ef' },
            { label: 'Real-time Socket.IO', val: '< 50ms', desc: 'Instant messaging & alerts', color: '#a855f7' },
            { label: 'Active Listings', val: '500+', desc: 'Verified property owners', color: '#60a5fa' },
            { label: 'Spam Protection', val: '100%', desc: 'Admin moderation & guards', color: '#34d399' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-panel"
              style={{ padding: '32px 24px', textAlign: 'center', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: item.color, marginBottom: '8px' }}>{item.val}</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </motion.div>
          ))}
        </section>
      </div>

      {/* World Map Connectivity Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        style={{ position: 'relative', zIndex: 1, background: 'var(--bg-primary)', left: '50%', transform: 'translateX(-50%)', width: '100vw' }}
      >
        <WorldMapDemo />
      </motion.section>
    </div>
  );
}
