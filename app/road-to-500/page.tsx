"use client";

import React from 'react';

export default function RoadPage() {
  const timeline = [
    { num: '01', title: 'THE DREAM', desc: 'Lanzamiento de la campaña.' },
    { num: '02', title: 'THE BUILD', desc: 'Carreras, entrenamientos y activaciones con la comunidad.' },
    { num: '03', title: 'THE COMMUNITY', desc: 'Retos y apadrinamiento de kilómetros.' },
    { num: '04', title: 'THE FINAL PREP', desc: 'Cuenta regresiva y envío a USA.' },
    { num: '05', title: 'THE SPEED PROJECT', desc: '500 km. Game on.' },
  ];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', paddingTop: '150px', alignItems: 'center' }}>
      
      <div style={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
        
        <h1 className="text-fluid-title" style={{ lineHeight: 1.1, marginBottom: '2rem' }}>
          ROAD TO 500
        </h1>
        
        <p className="font-mono" style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '4rem', lineHeight: 1.6 }}>
          UN CAMINO QUE EMPIEZA EN COLOMBIA<br/>
          Y TERMINA EN LAS VEGAS.
        </p>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: '3rem', marginBottom: '4rem' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', left: '10px', top: '10px', bottom: '20px', width: '2px', backgroundColor: 'var(--accent-lime)' }} />

          {timeline.map((item, idx) => (
            <div key={idx} style={{ position: 'relative', marginBottom: '3rem' }}>
              {/* Node */}
              <div style={{ position: 'absolute', left: '-3rem', top: '5px', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--accent-lime)', backgroundColor: 'var(--bg-primary)' }} />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{item.num}</div>
                <div>
                  <div className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</div>
                  <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pixel Art Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '2rem', paddingBottom: '4rem' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
             {/* Decorative pixel art proxy */}
             <div style={{ width: '100%', height: '100%', backgroundColor: 'transparent', border: '4px dashed var(--accent-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-lime)', maskImage: 'url("/running-ninja.svg")', WebkitMaskImage: 'url("/running-ninja.svg")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
             </div>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            border: '2px solid white', 
            borderRadius: '10px',
            fontFamily: 'var(--font-mono)',
            position: 'relative',
            fontSize: '1rem',
            lineHeight: 1.4,
            maxWidth: '250px'
          }}>
            IT'S<br/>A LONG WAY<br/>BUT WE GO<br/>TOGETHER
            <div style={{ position: 'absolute', left: '-10px', bottom: '20px', width: '10px', height: '10px', backgroundColor: 'var(--bg-primary)', borderBottom: '2px solid white', borderLeft: '2px solid white', transform: 'rotate(45deg)' }} />
          </div>
        </div>

      </div>
    </div>
  );
}
