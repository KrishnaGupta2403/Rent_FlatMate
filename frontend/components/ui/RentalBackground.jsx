'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ICONS = ['🏠', '🔑', '📍', '🛋️', '🏢', '🛌', '🤝', '✨'];

export default function RentalBackground() {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Generate random starting position and drift properties for floating icons
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      icon: ICONS[i % ICONS.length],
      x: Math.random() * 100, // percentage left
      y: Math.random() * 100, // percentage top
      scale: 0.6 + Math.random() * 0.8,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * -20, // negative delay so they start animated
      driftX: (Math.random() - 0.5) * 120, // pixel drift
      driftY: (Math.random() - 0.5) * 120,
    }));
    setElements(generated);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      {/* Dynamic Glowing Ambient Orbs */}
      <div 
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(60px)',
          animation: 'orb-float-one 25s infinite ease-in-out alternate'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.1) 0%, rgba(244, 114, 182, 0) 70%)',
          filter: 'blur(70px)',
          animation: 'orb-float-two 30s infinite ease-in-out alternate'
        }}
      />

      {/* Floating Rental Icons */}
      {elements.map((el) => (
        <motion.div
          key={el.id}
          style={{
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            fontSize: '1.6rem',
            opacity: 0.12,
            scale: el.scale,
            userSelect: 'none',
          }}
          animate={{
            x: [0, el.driftX, -el.driftX, 0],
            y: [0, el.driftY, -el.driftY, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut",
          }}
        >
          {el.icon}
        </motion.div>
      ))}

      {/* Keyframe Styles */}
      <style jsx global>{`
        @keyframes orb-float-one {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.1); }
          100% { transform: translate(-40px, 50px) scale(0.95); }
        }
        @keyframes orb-float-two {
          0% { transform: translate(0, 0) scale(0.95); }
          50% { transform: translate(-80px, 60px) scale(1.15); }
          100% { transform: translate(50px, -40px) scale(1); }
        }
      `}</style>
    </div>
  );
}
