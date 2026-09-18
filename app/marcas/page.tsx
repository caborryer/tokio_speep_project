"use client";

import React from 'react';

export default function MarcasPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', paddingTop: '150px', alignItems: 'center', overflowX: 'hidden' }}>
      
      <div style={{ maxWidth: '800px', textAlign: 'center' }}>
        
        <h1 className="text-fluid-title" style={{ lineHeight: 1.1, marginBottom: '2rem' }}>
          TU MARCA<br/>TAMBIÉN CORRE<br/>ESTA HISTORIA
        </h1>
        
        <p className="font-mono" style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem auto', lineHeight: 1.6 }}>
          Más que un patrocinio, es una plataforma de contenido, experiencias y comunidad.
        </p>

        {/* Icons Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', marginBottom: '4rem' }}>
          
          <div style={{ width: '150px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-magenta)', maskImage: 'url("/ninja-head.svg")', WebkitMaskImage: 'url("/ninja-head.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto 1rem auto' }} />
            <div className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>VISIBILIDAD</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>en una de las carreras más icónicas del mundo.</div>
          </div>

          <div style={{ width: '150px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-magenta)', maskImage: 'url("/light-fighter.svg")', WebkitMaskImage: 'url("/light-fighter.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto 1rem auto' }} />
            <div className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>CONTENIDO REAL</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Desde la preparación hasta la meta.</div>
          </div>

          <div style={{ width: '150px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-magenta)', maskImage: 'url("/samurai-helmet.svg")', WebkitMaskImage: 'url("/samurai-helmet.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto 1rem auto' }} />
            <div className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>EXPERIENCIAS</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Run with Manu, FanFest, eventos y clínicas.</div>
          </div>

          <div style={{ width: '150px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-magenta)', maskImage: 'url("/minions.svg")', WebkitMaskImage: 'url("/minions.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto 1rem auto' }} />
            <div className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>COMUNIDAD</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Conexión con corredores de alto rendimiento.</div>
          </div>

          <div style={{ width: '150px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-magenta)', maskImage: 'url("/infinity.svg")', WebkitMaskImage: 'url("/infinity.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', margin: '0 auto 1rem auto' }} />
            <div className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>PROPÓSITO</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Apoyar a un colombiano a hacer historia.</div>
          </div>

        </div>

        {/* Van Image */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
          <div style={{
            width: '100%',
            height: '300px',
            background: 'url("/7.png") center/cover',
            filter: 'grayscale(100%)'
          }} />
          
          {/* Arrow pointing to van */}
          <div className="neon-lime text-fluid-deco" style={{ position: 'absolute', top: '5%', right: '0%', fontFamily: 'var(--font-hand)', transform: 'rotate(15deg)' }}>
            TU<br/>MARCA<br/>AQUI<br/>
            <span style={{ display: 'inline-block', transform: 'rotate(90deg)' }}>↪</span>
          </div>
        </div>

        <button style={{
          padding: '1rem 3rem',
          backgroundColor: 'var(--accent-lime)',
          color: 'var(--bg-primary)',
          border: 'none',
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          textTransform: 'uppercase',
          marginBottom: '4rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          QUIERO SER PARTE <span>→</span>
        </button>

      </div>
    </div>
  );
}
