"use client";

import React, { useState } from 'react';
import { useUserStore } from '@/lib/userState';

export default function DonaPage() {
  const { totalKm, addKm } = useUserStore();
  const targetKm = 500;
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(80);

  const amounts = [
    { label: '$10', km: 0.1 },
    { label: '$40', km: 0.5 },
    { label: '$80', km: 1 },
    { label: '$400', km: 5 },
    { label: '$800', km: 10 }
  ];

  const handleDonate = () => {
    const selected = amounts.find(a => a.label === `$${selectedAmount}`) || amounts.find(a => a.km === selectedAmount);
    if (selected) {
      addKm(selected.km);
      alert(`¡Gracias por donar ${selected.label} (${selected.km} KM)!`);
    } else if (selectedAmount) {
      addKm(selectedAmount);
      alert(`¡Gracias!`);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px' }}>
      
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        
        <h1 className="text-fluid-title" style={{ lineHeight: 1.1, marginBottom: '1.5rem', textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>
          CADA DÓLAR<br/>MUEVE UN KM
        </h1>
        
        <p className="font-mono" style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '4rem', maxWidth: '400px', margin: '0 auto 4rem auto' }}>
          Tu aporte se convierte en kilómetros reales para llevar a Manu a la meta.
        </p>

        {/* Progress Bar Container */}
        <div style={{ marginBottom: '4rem', position: 'relative' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>{totalKm.toFixed(0)} <span style={{color: 'var(--text-secondary)'}}>/ {targetKm} KM</span></span>
          </div>
          
          <div style={{ 
            width: '100%', 
            height: '24px', 
            backgroundColor: 'transparent',
            border: '2px solid var(--track-inactive)',
            padding: '2px',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              width: `${Math.min((totalKm / targetKm) * 100, 100)}%`, 
              height: '100%', 
              backgroundColor: 'var(--accent-lime)',
              transition: 'width 0.5s ease-out' 
            }} />
          </div>

          <div style={{ position: 'absolute', left: '-30px', top: '10px', color: 'var(--accent-magenta)', fontSize: '2rem' }}>
            ■
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {amounts.map((item, idx) => {
            const isSelected = selectedAmount === item.km || selectedAmount === parseInt(item.label.replace('$', ''));
            return (
              <button
                key={idx}
                onClick={() => setSelectedAmount(item.km)}
                style={{
                  padding: '1.5rem 0',
                  backgroundColor: 'transparent',
                  border: isSelected ? '2px solid var(--accent-magenta)' : '1px solid var(--track-inactive)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 0 10px rgba(247, 37, 133, 0.5)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.km} KM</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleDonate}
          style={{
            padding: '1rem 4rem',
            backgroundColor: 'var(--accent-magenta)',
            color: '#fff',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          DONA AHORA <span>→</span>
        </button>

        <div>
          <button style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer'
          }}>
            OTRO MONTO
          </button>
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--accent-lime)', maskImage: 'url("/shambling-zombie.svg")', WebkitMaskImage: 'url("/shambling-zombie.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
          <div style={{ 
            padding: '1rem', 
            border: '2px solid white', 
            borderRadius: '10px',
            fontFamily: 'var(--font-mono)',
            position: 'relative'
          }}>
            ¡CADA KM<br/>CUENTA!
            <div style={{ position: 'absolute', left: '-10px', top: '50%', width: '10px', height: '10px', backgroundColor: 'var(--bg-primary)', borderTop: '2px solid white', borderLeft: '2px solid white', transform: 'rotate(-45deg)' }} />
          </div>
        </div>

      </div>
    </div>
  );
}
