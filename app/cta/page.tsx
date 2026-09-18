"use client";

import React from 'react';
import { useUserStore } from '@/lib/userState';
import Link from 'next/link';

export default function CTAPage() {
  const { totalKm } = useUserStore();
  const targetKm = 500;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', paddingTop: '150px', alignItems: 'flex-start', paddingBottom: '4rem' }}>
      
      <div style={{ maxWidth: '600px', width: '100%' }}>
        
        <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '2rem' }}>
          ¿QUÉ KILÓMETRO<br/>VAS A CORRER<br/>CON MANU?
        </h1>
        
        {/* Progress Bar Container */}
        <div style={{ marginBottom: '3rem', position: 'relative' }}>
          <div style={{ 
            width: '100%', 
            height: '24px', 
            backgroundColor: 'transparent',
            border: '2px solid var(--track-inactive)',
            padding: '2px',
            boxSizing: 'border-box',
            display: 'inline-block',
            maxWidth: '300px'
          }}>
            <div style={{ 
              width: `${Math.min((totalKm / targetKm) * 100, 100)}%`, 
              height: '100%', 
              backgroundColor: 'var(--accent-lime)',
              transition: 'width 0.5s ease-out' 
            }} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-mono)', marginLeft: '1rem', verticalAlign: 'top', marginTop: '4px', display: 'inline-block' }}>
            {totalKm.toFixed(0)} <span style={{color: 'var(--text-secondary)'}}>/ {targetKm} KM</span>
          </span>
        </div>

        <Link href="/dona" style={{
          padding: '1rem 3rem',
          backgroundColor: 'var(--accent-magenta)',
          color: '#fff',
          border: 'none',
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          textDecoration: 'none'
        }}>
          DONA UN KM <span>→</span>
        </Link>
        <br />

        <Link href="/marcas" style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'none', cursor: 'pointer',
          borderBottom: '1px solid var(--track-inactive)', paddingBottom: '0.5rem', display: 'inline-block'
        }}>
          O CONVIÉRTETE EN PATROCINADOR →
        </Link>

      </div>

      {/* Decorative texts */}
      <div style={{ position: 'absolute', right: '10%', top: '30%', fontFamily: 'var(--font-hand)', fontSize: '3rem', transform: 'rotate(-15deg)', zIndex: 0 }} className="neon-magenta">
        RUN<br/>MORE<br/>THINK<br/>LESS
      </div>
      
    </div>
  );
}
