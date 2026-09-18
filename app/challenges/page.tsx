"use client";

import React from 'react';
import { useUserStore } from '@/lib/userState';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

export default function ChallengesPage() {
  const { challenges, points } = useUserStore();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--accent-lime)', textAlign: 'center', marginBottom: '1rem' }}>TUS RETOS</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>PUNTOS ACUMULADOS</p>
        <p style={{ fontSize: '4rem', color: 'var(--accent-magenta)', fontFamily: 'var(--font-display)', margin: 0 }}>{points} PTS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {challenges.map(c => (
          <motion.div 
            key={c.id}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '1.5rem',
              backgroundColor: c.completed ? 'var(--state-complete)' : 'var(--bg-secondary)',
              border: c.completed ? '2px solid var(--accent-lime)' : '1px solid var(--track-inactive)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.5rem', color: c.completed ? 'var(--accent-lime)' : 'var(--text-primary)', margin: 0 }}>{c.title}</h3>
              {c.completed ? <CheckCircle2 color="var(--accent-lime)" /> : <Circle color="var(--track-inactive)" />}
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{c.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{c.targetKm} KM</span>
              <span className="font-mono" style={{ color: 'var(--accent-magenta)' }}>+{c.pointsReward} PTS</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
