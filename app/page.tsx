"use client";

import React from 'react';
import Link from 'next/link';
import DinoLoader from '@/components/DinoLoader';

export default function Home() {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

      {/* Loader de inicio: juego tipo dinosaurio de Chrome con Manuel (KAPLAY) */}
      <DinoLoader />
      
      {/* Decorative Background Image */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        backgroundImage: 'radial-gradient(circle at center, rgba(198, 241, 53, 0.05) 0%, transparent 60%)',
        zIndex: -1,
        overflow: 'hidden'
      }}>
        {/* Character image positioned on the right */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '100%',
          maxWidth: '600px',
          height: '85vh',
          background: 'url("/5.png") center bottom/contain no-repeat',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          opacity: 0.9,
          zIndex: 0
        }} />

        {/* Decorative text */}
        <div className="neon-magenta text-fluid-deco" style={{ position: 'absolute', top: '15%', right: 'auto', left: '5%', fontFamily: 'var(--font-hand)', transform: 'rotate(-15deg)', zIndex: 0, opacity: 0.8 }}>
          LOS<br/>ANGELES
        </div>
        <div className="neon-magenta text-fluid-deco" style={{ position: 'absolute', top: '25%', right: '5%', fontFamily: 'var(--font-hand)', transform: 'rotate(-10deg)', zIndex: 0, opacity: 0.8 }}>
          LAS<br/>VEGAS
        </div>
        <div className="text-fluid-deco" style={{ position: 'absolute', bottom: '30%', right: '5%', fontFamily: 'var(--font-hand)', transform: 'rotate(10deg)', textAlign: 'right', color: '#fff', zIndex: 0, opacity: 0.8 }}>
          LET'S<br/>RUN<br/>THIS<br/>TOGETHER
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10, paddingTop: '120px' }}>
        
        <div style={{ maxWidth: '600px', marginTop: '10vh' }}>
          <h1 className="text-fluid-title" style={{ marginBottom: '1rem', textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>
            500 KM.<br/>
            UNA META.<br/>
            MUCHOS QUE<br/>
            LA CORREN.
          </h1>
          
          <p className="font-mono text-fluid-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', letterSpacing: '1px', lineHeight: 1.5, fontSize: '0.8rem' }}>
            EL PRIMER COLOMBIANO<br/>
            EN COMPLETAR<br/>
            THE SPEED PROJECT
          </p>

          <div className="flex-row-mobile gap-responsive" style={{ flexWrap: 'nowrap' }}>
            <Link href="/dona" style={{
              padding: '0.8rem 1rem',
              backgroundColor: 'var(--accent-lime)',
              color: 'var(--bg-primary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              DONA UN KM
            </Link>
            <Link href="/reto" style={{
              padding: '0.8rem 1rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '2px solid var(--text-primary)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              CONOCE EL RETO
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container" style={{ paddingBottom: '2rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, gap: '2rem' }}>
        
        <div className="hidden-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          SCROLL<br/>
          <span style={{ fontSize: '1.2rem' }}>v</span>
        </div>

        {/* Data Badges */}
        <div className="flex-wrap gap-responsive" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
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

        <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '150px' }}>
          CORRER<br/>INSPIRA<br/>CONECTA<br/>TRANSFORMA
        </div>
      </div>
      
    </div>
  );
}
