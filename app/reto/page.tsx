"use client";

import React from 'react';
import { Component as HorizonBackground } from '@/components/ui/horizon-hero-section';

export default function RetoPage() {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      
      {/* 3D Horizon Background */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
        opacity: 0.6, // slightly fade it to make text readable
        pointerEvents: 'none' // allow clicks to pass through
      }}>
        <HorizonBackground />
      </div>

      <div className="neon-magenta text-fluid-deco" style={{ position: 'absolute', top: '15%', right: '5%', fontFamily: 'var(--font-hand)', transform: 'rotate(-10deg)', zIndex: 0 }}>
        SAME<br/>ROADS<br/>DIFFERENT<br/>MINDS
      </div>

      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '150px', alignItems: 'center', overflowX: 'hidden', position: 'relative', zIndex: 10 }}>
        
        <div style={{ maxWidth: '600px' }}>
          <h1 className="text-fluid-title" style={{ lineHeight: 1, marginBottom: '0.5rem' }}>
            EL RETO
          </h1>
          <h2 className="text-fluid-subtitle" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'normal', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            THE SPEED PROJECT
          </h2>
          
          <div style={{ fontFamily: 'var(--font-mono)', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--accent-magenta)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>500 KM</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.5 }}>
              DE LOS ÁNGELES A LAS VEGAS<br/>
              A TRAVÉS DEL DEATH VALLEY
            </p>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '400px' }}>
            Creada en 2013, solo por invitación. Participan 30 personas. Sin reglas. Cada uno planea su estrategia para llegar en el menor tiempo posible.
          </div>

          {/* Simple Map Representation */}
          <div style={{ position: 'relative', height: '150px', marginBottom: '3rem', borderTop: '2px dashed var(--accent-magenta)', width: '100%', marginTop: '50px' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '20%', textAlign: 'center' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--accent-lime)', borderRadius: '50%', margin: '0 auto' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.5rem' }}>LOS ANGELES</div>
            </div>
            
            <div style={{ position: 'absolute', top: '-10px', right: '10%', textAlign: 'center' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--accent-magenta)', borderRadius: '50%', margin: '0 auto' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.5rem' }}>LAS VEGAS</div>
            </div>

            <div style={{ position: 'absolute', top: '-30px', left: '50%', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
              500 KM
            </div>
          </div>

          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer'
          }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ▶
            </div>
            VER VIDEO
          </button>
        </div>
      </div>

      <div className="container flex-wrap gap-responsive" style={{ paddingBottom: '2rem', display: 'flex', justifyContent: 'center', zIndex: 10, marginTop: '4rem' }}>
        <div className="font-mono" style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-lime)', maskImage: 'url("/trail.svg")', WebkitMaskImage: 'url("/trail.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto' }} />
          <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>500 KM</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DISTANCIA</div>
        </div>
        <div className="font-mono" style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-lime)', maskImage: 'url("/thermometer-hot.svg")', WebkitMaskImage: 'url("/thermometer-hot.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto' }} />
          <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>+50°C</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>TEMPERATURAS</div>
        </div>
        <div className="font-mono" style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-lime)', maskImage: 'url("/mountains.svg")', WebkitMaskImage: 'url("/mountains.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto' }} />
          <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>DEATH VALLEY</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>TERRENO EXTREMO</div>
        </div>
        <div className="font-mono" style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-lime)', maskImage: 'url("/conqueror.svg")', WebkitMaskImage: 'url("/conqueror.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto' }} />
          <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>30</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ATLETAS</div>
        </div>
      </div>

    </div>
  );
}
