"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { progressRingVertexShader, progressRingFragmentShader } from './progressRingShader';
import { useUserStore } from '@/lib/userState';

const Ring = ({ progress, targetKm }: { progress: number, targetKm: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const ringGroup = useRef<THREE.Group>(null);
  
  // Animate the progress filling up on load
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useFrame((state, delta) => {
    // Lerp progress to actual
    const targetProgress = Math.min(progress / targetKm, 1);
    setAnimatedProgress(prev => THREE.MathUtils.lerp(prev, targetProgress, 0.05));
    
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = animatedProgress;
    }

    if (ringGroup.current) {
      ringGroup.current.rotation.z -= delta * 0.2; // Subtle rotation
    }
  });

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uColorLime: { value: new THREE.Color('#c6f135') },
    uColorMagenta: { value: new THREE.Color('#f72585') }
  }), []);

  return (
    <group ref={ringGroup}>
      {/* Background Track */}
      <mesh>
        <torusGeometry args={[3, 0.2, 16, 100]} />
        <meshBasicMaterial color="#3a3a3a" transparent opacity={0.5} />
      </mesh>
      
      {/* Progress Track */}
      <mesh>
        <torusGeometry args={[3, 0.25, 16, 100]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={progressRingVertexShader}
          fragmentShader={progressRingFragmentShader}
          uniforms={uniforms}
          transparent={true}
        />
      </mesh>
    </group>
  );
};

export default function ProgressRing3D() {
  const { totalKm } = useUserStore();
  const targetKm = 500;
  
  const [isClient, setIsClient] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Simple WebGL feature detect
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!isClient) return <div style={{ height: '300px' }} />; // Skeleton

  if (!hasWebGL) {
    // Fallback SVG
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(totalKm / targetKm, 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="300" height="300" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="150" cy="150" r={radius} stroke="var(--track-inactive)" strokeWidth="10" fill="none" />
          <circle cx="150" cy="150" r={radius} stroke="var(--accent-lime)" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', margin: 0, color: 'var(--accent-magenta)' }}>{totalKm}</h2>
          <p className="font-mono" style={{ margin: 0, color: 'var(--text-secondary)' }}>/ {targetKm} KM</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <Ring progress={totalKm} targetKm={targetKm} />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <h2 style={{ fontSize: '4rem', margin: 0, color: 'var(--text-primary)', textShadow: '0 0 10px var(--accent-magenta)' }}>{totalKm}</h2>
        <p className="font-mono" style={{ margin: 0, color: 'var(--text-secondary)' }}>/ {targetKm} KM</p>
      </div>
    </div>
  );
}
