"use client";

import { useRef, useCallback, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

import { StarsBackground } from "./StarsBackground";
import { Planet } from "./Planet";
import { PlanetFragments, PlanetFragmentsHandle } from "./PlanetFragments";
import { Lights } from "./Lights";
import { CameraRig } from "./CameraRig";

// ─── BloomPass ────────────────────────────────────────────────────────────────
// Manual UnrealBloomPass via Three.js post-processing — avoids
// @react-three/postprocessing's EffectComposer which flashes on any
// scene graph change (visible toggles, shadow map updates, etc.)
// ─────────────────────────────────────────────────────────────────────────────
function PostProcessing() {
  const { gl, scene, camera, size } = useThree();

  useEffect(() => {
    // Lazy-import to avoid SSR issues
    let composer: import("three/examples/jsm/postprocessing/EffectComposer.js").EffectComposer;
    let animId: number;

    const setup = async () => {
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");
      const { ShaderPass } = await import("three/examples/jsm/postprocessing/ShaderPass.js");
      const { GammaCorrectionShader } = await import("three/examples/jsm/shaders/GammaCorrectionShader.js");

      composer = new EffectComposer(gl);
      composer.setSize(size.width, size.height);
      composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      composer.addPass(new RenderPass(scene, camera));

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        0.9,   // strength
        0.5,   // radius
        0.2    // threshold
      );
      composer.addPass(bloom);

      // Gamma correction keeps colours stable — no flicker
      composer.addPass(new ShaderPass(GammaCorrectionShader));

      // Replace R3F's render loop with our composer
      gl.autoClear = false;

      // Store on gl so useFrame can access
      (gl as unknown as { __composer: typeof composer }).__composer = composer;
    };

    setup();

    const handleResize = () => {
      if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
      composer?.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive the composer every frame instead of R3F's default renderer
  useFrame(() => {
    const composer = (gl as unknown as { __composer?: { render: () => void } }).__composer;
    if (composer) {
      gl.clear();
      composer.render();
    }
  }, 1); // priority 1 = runs after scene updates

  return null;
}

// ─── SceneContent ─────────────────────────────────────────────────────────────
// Kept separate so Canvas never re-renders its children.
// ─────────────────────────────────────────────────────────────────────────────
function SceneContent({
  fragmentsRef,
  planetGroupRef,
  handleExplode,
}: {
  fragmentsRef: React.RefObject<PlanetFragmentsHandle>;
  planetGroupRef: React.RefObject<THREE.Group>;
  handleExplode: () => void;
}) {
  return (
    <>
      <CameraRig />
      <fog attach="fog" args={["#010818", 30, 100]} />
      <Lights />
      <StarsBackground count={4000} radius={80} />
      <Suspense fallback={null}>
        <Planet onExplode={handleExplode} groupRef={planetGroupRef} />
        <PlanetFragments ref={fragmentsRef} />
      </Suspense>
      <PostProcessing />
    </>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export function Scene() {
  const fragmentsRef = useRef<PlanetFragmentsHandle>(null!);
  const planetGroupRef = useRef<THREE.Group>(null!);
  const isTransitioning = useRef(false);

  const handleExplode = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    const planetGroup = planetGroupRef.current;

    // Show fragments at their original positions first
    fragmentsRef.current?.showFragments();

    // Next animation frame: hide planet, launch fragments
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (planetGroup) planetGroup.visible = false;
        fragmentsRef.current?.explode();

        gsap.delayedCall(4, () => {
          fragmentsRef.current?.reassemble(() => {
            if (planetGroup) planetGroup.visible = true;
            fragmentsRef.current?.hideFragments();
            isTransitioning.current = false;
          });
        });
      });
    });
  }, []);

  return (
    <Canvas
      frameloop="always"
      camera={{ fov: 55, near: 0.1, far: 200, position: [0, 0, 7] }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "auto",
        zIndex: 0,
        background: "#010818",
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        // Disable auto-clear — our composer handles it
        autoClear: false,
      }}
      // No shadows prop — shadow maps cause flash on first frame
    >
      <SceneContent
        fragmentsRef={fragmentsRef}
        planetGroupRef={planetGroupRef}
        handleExplode={handleExplode}
      />
    </Canvas>
  );
}