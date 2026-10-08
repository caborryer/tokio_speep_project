"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Las vistas del rediseño traen su propia navegación (etiquetas amarillas): ocultamos el header global ahí.
  const pathname = usePathname();
  const isHome = ['/', '/dona', '/manu', '/marcas', '/road-to-500', '/reto'].includes(pathname);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isHome && (
      <header className="app-header" style={{ zIndex: 60 }}>
        <div className="header-logo-container" style={{ position: 'relative', zIndex: 60 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', lineHeight: '1', color: 'var(--text-primary)' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              THE<br />
              <span style={{ fontSize: '1.4rem' }}>500 KM</span><br />
              PROJECT
            </Link>
          </div>
          <button 
            className="hidden-desktop" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 60, position: 'relative' }}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="app-nav hidden-mobile">
          <Link href="/reto" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '1px' }}>EL RETO</Link>
          <Link href="/manu" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '1px' }}>MANU</Link>
          <Link href="/dona" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '1px' }}>DONA UN KM</Link>
          <Link href="/marcas" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '1px' }}>MARCAS</Link>
          <Link href="/road-to-500" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '1px' }}>ROAD TO 500</Link>
          <Link href="/comunidad" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '1px' }}>COMUNIDAD</Link>
          <Link href="/dona" style={{
            backgroundColor: 'var(--accent-lime)',
            color: 'var(--bg-primary)',
            textDecoration: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem',
            padding: '0.5rem 1.5rem',
            textTransform: 'uppercase'
          }}>
            DONA AHORA
          </Link>
        </nav>
      </header>
      )}
      
      {/* Mobile Nav Overlay */}
      {!isHome && isMobileMenuOpen && (
        <nav className="hidden-desktop" style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-primary)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <Link href="/reto" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', letterSpacing: '1px', textAlign: 'center' }}>EL RETO</Link>
          <Link href="/manu" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', letterSpacing: '1px', textAlign: 'center' }}>MANU</Link>
          <Link href="/dona" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', letterSpacing: '1px', textAlign: 'center' }}>DONA UN KM</Link>
          <Link href="/marcas" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', letterSpacing: '1px', textAlign: 'center' }}>MARCAS</Link>
          <Link href="/road-to-500" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', letterSpacing: '1px', textAlign: 'center' }}>ROAD TO 500</Link>
          <Link href="/comunidad" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', letterSpacing: '1px', textAlign: 'center' }}>COMUNIDAD</Link>
          <Link href="/dona" onClick={() => setIsMobileMenuOpen(false)} style={{
            backgroundColor: 'var(--accent-lime)',
            color: 'var(--bg-primary)',
            textDecoration: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            padding: '1rem 3rem',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            DONA AHORA
          </Link>
        </nav>
      )}
      
      <main style={{ flex: 1, position: 'relative' }}>
        {children}
      </main>

      {/* The bottom data badges are only shown on HOME and RETO in the design, I'll move them to those specific pages or keep them conditionally rendered. For now I'll remove them from the global layout so they don't break other pages like DONA. */}
    </div>
  );
}
