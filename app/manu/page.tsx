"use client";

import React, { useState } from 'react';
import MorphGallery from '@/components/ui/morph-gallery';

export default function ManuPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const ITEMS = [
    { src: '/6.png' },
    { src: '/1.png' },
    { src: '/2.png' },
    { src: '/3.png' },
    { src: '/4.png' }
  ];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', paddingTop: '150px' }}>
      
      <div className="flex-col-mobile gap-responsive" style={{ alignItems: 'flex-start' }}>
        
        {/* Profile Image Area */}
        <div style={{ flex: 1, position: 'relative', width: '100%' }}>
          <div style={{
            width: '100%',
            aspectRatio: '3/4',
            filter: 'grayscale(100%)',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            overflow: 'hidden'
          }}>
            <MorphGallery 
              items={ITEMS} 
              index={activeIndex} 
              onIndexChange={setActiveIndex}
              height="100%" 
              thumbnails={false} 
              arrows={false} 
              autoplay={0}
            />
          </div>
        </div>

        {/* Info Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <h1 className="text-fluid-title" style={{ lineHeight: 1, marginBottom: '2rem' }}>
            MANUEL<br/>AGUDELO
          </h1>
          
          <h3 className="text-fluid-subtitle" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '2rem', letterSpacing: '1px' }}>
            CORREDOR. EDUCADOR. INSPIRACIÓN.
          </h3>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '400px' }}>
            Tengo 40 años, soy Licenciado en Educación Física y llevo más de 23 años corriendo. Mi pasión es desafiar la distancia.
          </p>

          <button style={{
            background: 'none', border: 'none', color: 'var(--accent-magenta)',
            fontFamily: 'var(--font-mono)', fontSize: '0.9rem', cursor: 'pointer',
            textAlign: 'left', marginBottom: '4rem'
          }}>
            CONOCE MI HISTORIA →
          </button>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', rowGap: '3rem' }}>
            
            <div>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-lime)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>51.750</div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>KM TOTALES</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-lime)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>224.563 M</div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>DESNIVEL ACUMULADO</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-lime)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>310 KM</div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>MÁXIMA DISTANCIA</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-lime)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>10</div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>PAÍSES</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent-lime)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>23+</div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>AÑOS CORRIENDO</div>
            </div>

            <div>
              <div style={{ fontSize: '1.5rem', color: 'var(--accent-lime)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>ENTRENADOR</div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>WORLD ATHLETICS NIVEL 1</div>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Photos and Quote */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', alignItems: 'center', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          {[1,2,3,4].map((imgNum, idx) => {
            const actualIndex = idx + 1;
            return (
              <div 
                key={actualIndex} 
                onClick={() => setActiveIndex(actualIndex)}
                style={{ 
                  flex: 1, 
                  aspectRatio: '1', 
                  background: `url("/${imgNum}.png") center/cover`, 
                  filter: activeIndex === actualIndex ? 'grayscale(0%)' : 'grayscale(100%)',
                  opacity: activeIndex === actualIndex ? 1 : 0.6,
                  cursor: 'pointer',
                  border: activeIndex === actualIndex ? '2px solid var(--accent-magenta)' : '2px solid transparent',
                  transition: 'all 0.3s ease'
                }} 
              />
            );
          })}
        </div>
        
        <div style={{ flex: 1, paddingLeft: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--accent-lime)', fontSize: '2rem' }}>"</span>
            Los límites siempre pueden moverse un poco más.
            <span style={{ color: 'var(--accent-lime)', fontSize: '2rem' }}>"</span>
          </p>
        </div>
      </div>

    </div>
  );
}
