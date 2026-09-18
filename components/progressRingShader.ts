import * as THREE from 'three';

export const progressRingVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const progressRingFragmentShader = `
  uniform float uProgress;
  uniform vec3 uColorLime;
  uniform vec3 uColorMagenta;

  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    // Calculate angle from center (-PI to PI)
    float angle = atan(vPosition.y, vPosition.x);
    // Normalize to 0 - 1 range starting from top (PI/2)
    float normalizedAngle = mod((angle - 1.57079632679) / (2.0 * 3.14159265359), 1.0);
    
    // Invert direction to go clockwise
    normalizedAngle = 1.0 - normalizedAngle;

    if (normalizedAngle > uProgress) {
      discard; // Don't draw the part of the ring beyond progress
    }

    // Gradient mix based on angle
    vec3 color = mix(uColorLime, uColorMagenta, normalizedAngle);

    // Basic emissive glow
    gl_FragColor = vec4(color, 1.0);
  }
`;
