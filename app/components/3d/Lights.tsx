"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Lights() {
  const orbitRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    if (!orbitRef.current) return;
    const t = clock.getElapsedTime() * 0.25;
    orbitRef.current.position.set(Math.sin(t)*7, Math.sin(t*0.6)*2, Math.cos(t)*7);
  });

  return (
    <>
      {/* Deep ambient — nearly black, barely visible */}
      <ambientLight intensity={0.08} color="#060d1a" />
      {/* Key from upper-left — cool blue-white */}
      <directionalLight position={[6, 8, 5]}  intensity={1.6} color="#aac8f0" />
      {/* Rim from behind — subtle electric blue */}
      <directionalLight position={[-5,-2,-7]} intensity={0.8} color="#0055aa" />
      {/* Slow orbiting fill */}
      <pointLight ref={orbitRef} intensity={1.2} color="#2266cc" distance={20} decay={2} />
    </>
  );
}