"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── StarsBackground ────────────────────────────────────────────────────────
// Renders 4000 stars as an instanced BufferGeometry point cloud.
// Stars slowly drift and twinkle; a small subset of "bright" stars pulse.
// ─────────────────────────────────────────────────────────────────────────────

interface StarsBackgroundProps {
  count?: number;
  radius?: number;
}

export function StarsBackground({ count = 4000, radius = 80 }: StarsBackgroundProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const brightRef = useRef<THREE.Points>(null!);
  const timeRef = useRef(0);

  // Build star positions + sizes once
  const { positions, sizes, brightPositions, brightSizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.5 + Math.random() * 0.5);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 1.5 + 0.3;
    }

    // 80 bright accent stars
    const brightCount = 80;
    const brightPositions = new Float32Array(brightCount * 3);
    const brightSizes = new Float32Array(brightCount);
    for (let i = 0; i < brightCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.6 + Math.random() * 0.4);
      brightPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      brightPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      brightPositions[i * 3 + 2] = r * Math.cos(phi);
      brightSizes[i] = Math.random() * 3 + 2;
    }

    return { positions, sizes, brightPositions, brightSizes };
  }, [count, radius]);

  // Star shader material
  const starMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color("#b8d4ff") },
        },
        vertexShader: `
          attribute float size;
          uniform float time;
          varying float vAlpha;
          void main() {
            vAlpha = 0.5 + 0.5 * sin(time * 0.8 + position.x * 0.3 + position.y * 0.2);
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPos.z);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float vAlpha;
          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            float strength = 1.0 - (d * 2.0);
            strength = pow(strength, 1.5);
            gl_FragColor = vec4(color, strength * vAlpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // Bright star material (cyan-white tint)
  const brightMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color("#7fc8ff") },
        },
        vertexShader: `
          attribute float size;
          uniform float time;
          varying float vAlpha;
          void main() {
            vAlpha = 0.7 + 0.3 * sin(time * 1.2 + position.z * 0.5);
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPos.z);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float vAlpha;
          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            float strength = 1.0 - (d * 2.0);
            strength = pow(strength, 1.2);
            gl_FragColor = vec4(color, strength * vAlpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    timeRef.current += delta;
    starMaterial.uniforms.time.value = timeRef.current;
    brightMaterial.uniforms.time.value = timeRef.current;

    // Slow star field drift
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.003;
      pointsRef.current.rotation.x += delta * 0.001;
    }
    if (brightRef.current) {
      brightRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <group>
      {/* Main star field */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <primitive object={starMaterial} attach="material" />
      </points>

      {/* Bright accent stars */}
      <points ref={brightRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[brightPositions, 3]} />
          <bufferAttribute attach="attributes-size" args={[brightSizes, 1]} />
        </bufferGeometry>
        <primitive object={brightMaterial} attach="material" />
      </points>
    </group>
  );
}