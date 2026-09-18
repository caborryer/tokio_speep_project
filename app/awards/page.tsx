"use client";

import React from 'react';
import { useUserStore } from '@/lib/userState';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function AwardsPage() {
  const { awards, points, redeemAward } = useUserStore();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--accent-lime)', textAlign: 'center', marginBottom: '1rem' }}>PREMIOS</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>TUS PUNTOS</p>
        <p style={{ fontSize: '4rem', color: 'var(--accent-magenta)', fontFamily: 'var(--font-display)', margin: 0 }}>{points} PTS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
        {awards.map(a => (
          <motion.div 
            key={a.id}
            whileHover={a.unlocked ? { scale: 1.05 } : {}}
            style={{
              position: 'relative',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: a.unlocked ? '1px solid var(--accent-magenta)' : '1px solid var(--track-inactive)',
              borderRadius: '8px',
              opacity: a.unlocked ? 1 : 0.6,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {!a.unlocked && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <Lock size={48} color="var(--text-secondary)" />
              </div>
            )}
            
            <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--track-inactive)', borderRadius: '50%', marginBottom: '1rem' }} />
            
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{a.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{a.description}</p>
            
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <button 
                onClick={() => redeemAward(a.id)}
                disabled={!a.unlocked || a.redeemed || points < a.costPoints}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: a.redeemed ? 'var(--track-inactive)' : 'var(--accent-magenta)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  cursor: (a.unlocked && !a.redeemed && points >= a.costPoints) ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase'
                }}
              >
                {a.redeemed ? 'CANJEADO' : `CANJEAR (${a.costPoints} PTS)`}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
