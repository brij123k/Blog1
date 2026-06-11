"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

// ─── CameraRig ───────────────────────────────────────────────────────────────
// Smooth mouse-reactive camera that doesn't cause motion sickness.
// Also reacts subtly to scroll position.
// ─────────────────────────────────────────────────────────────────────────────

export function CameraRig() {
  const { camera } = useThree();

  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);

  // Intro animation
  useEffect(() => {
    camera.position.set(0, 0, 20);
    gsap.to(camera.position, {
      z: 7,
      duration: 2.5,
      ease: "power3.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [camera]);

  useFrame((_, delta) => {
    const lerpFactor = 1 - Math.pow(0.05, delta);

    // Smooth interpolate toward mouse
    target.current.x += (mouse.current.x * 1.2 - target.current.x) * lerpFactor;
    target.current.y += (mouse.current.y * 0.8 - target.current.y) * lerpFactor;

    camera.position.x = target.current.x;
    camera.position.y = target.current.y - scrollY.current * 0.004;

    // Always look slightly toward center
    camera.lookAt(
      new THREE.Vector3(
        -target.current.x * 0.3,
        -target.current.y * 0.3 + scrollY.current * 0.002,
        0
      )
    );
  });

  return null;
}