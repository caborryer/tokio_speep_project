"use client";

import React from 'react';

export default function ComunidadPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', paddingTop: '150px' }}>
      
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        
        <h1 className="text-fluid-title" style={{ lineHeight: 1.1, marginBottom: '2rem' }}>
          UNA COMUNIDAD<br/>SIN LÍMITES
        </h1>
        
        <p className="font-mono" style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '4rem', maxWidth: '400px', lineHeight: 1.6 }}>
          Personas, corredores y marcas que creen en el poder de ir más lejos.
        </p>

        {/* Photo Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridAutoRows: 'minmax(100px, 15vw)',
          gap: '10px',
          marginBottom: '2rem'
        }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{
              background: `url("https://images.unsplash.com/photo-1541252876101-7053cc64771e?q=80&w=400&auto=format&fit=crop") center/cover`,
              filter: 'grayscale(100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {i === 4 && (
                 <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ fontFamily: 'var(--font-hand)', fontSize: 'clamp(1rem, 3vw, 2.5rem)', color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1 }}>
                     GOOD<br/>RUNNERS<br/>BAD<br/>DAYS
                   </div>
                 </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '4rem' }}>
          <button style={{
            padding: '1rem 2rem',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            border: '2px solid var(--text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            SÚMATE A LA COMUNIDAD <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
}
