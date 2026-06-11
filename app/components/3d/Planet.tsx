"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

// ─── Planet ───────────────────────────────────────────────────────────────────
// FIX: accepts `groupRef` so Scene can toggle .visible imperatively —
// zero React state changes, zero blink.
// ─────────────────────────────────────────────────────────────────────────────

interface PlanetProps {
  onExplode: () => void;
  groupRef: React.RefObject<THREE.Group>;
}

export function Planet({ onExplode, groupRef }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const outerGlowRef = useRef<THREE.Mesh>(null!);
  const hovered = useRef(false);
  const { gl } = useThree();
  const timeRef = useRef(0);

  const planetMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        crackColor: { value: new THREE.Color("#00aaff") },
        rockColor: { value: new THREE.Color("#0a1828") },
        rockColor2: { value: new THREE.Color("#071320") },
        glowIntensity: { value: 1.0 },
        hoverIntensity: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 crackColor;
        uniform vec3 rockColor;
        uniform vec3 rockColor2;
        uniform float glowIntensity;
        uniform float hoverIntensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        vec3 hash3(vec3 p) {
          p = vec3(dot(p,vec3(127.1,311.7,74.7)),
                   dot(p,vec3(269.5,183.3,246.1)),
                   dot(p,vec3(113.5,271.9,124.6)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          vec3 u = f*f*(3.0-2.0*f);
          return mix(mix(mix(dot(hash3(i+vec3(0,0,0)),f-vec3(0,0,0)),
                             dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                         mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),
                             dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
                     mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),
                             dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                         mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),
                             dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);
        }

        vec2 voronoi(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          float minDist = 100.0;
          float minDist2 = 100.0;
          for(int z = -1; z <= 1; z++)
          for(int y = -1; y <= 1; y++)
          for(int x = -1; x <= 1; x++) {
            vec3 offset = vec3(float(x), float(y), float(z));
            vec3 h = hash3(i + offset) * 0.5 + 0.5;
            vec3 d = offset + h - f;
            float dist = length(d);
            if(dist < minDist) { minDist2 = minDist; minDist = dist; }
            else if(dist < minDist2) { minDist2 = dist; }
          }
          return vec2(minDist, minDist2);
        }

        void main() {
          vec3 scaledPos = vPosition * 2.2;
          vec2 vor = voronoi(scaledPos);
          float crackWidth = 0.08;
          float crack = smoothstep(0.0, crackWidth, vor.y - vor.x);

          vec3 scaledPos2 = vPosition * 5.5;
          vec2 vor2 = voronoi(scaledPos2);
          float crack2 = smoothstep(0.0, 0.05, vor2.y - vor2.x);

          float crackMask = crack * crack2;

          float n1 = noise(vPosition * 4.0) * 0.5 + 0.5;
          float n2 = noise(vPosition * 8.0 + 1.3) * 0.5 + 0.5;
          vec3 rock = mix(rockColor, rockColor2, n1 * 0.6 + n2 * 0.4);

          float nearCrack = 1.0 - crackMask;
          rock = mix(rock, rock + vec3(0.02, 0.06, 0.12), nearCrack * 0.6);

          float pulse = 0.85 + 0.15 * sin(time * 1.5 + vor.x * 8.0);
          float cracksEmit = (1.0 - crackMask) * pulse * glowIntensity;
          cracksEmit += (1.0 - crackMask) * hoverIntensity * 0.4;

          vec3 finalColor = mix(crackColor * cracksEmit * 2.5, rock, crackMask);

          float fresnel = pow(1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0), 3.0);
          finalColor += crackColor * fresnel * 0.3 * glowIntensity;

          float coreBright = (1.0 - crackMask) * pulse;
          finalColor = mix(finalColor, vec3(0.7, 0.9, 1.0), coreBright * 0.15);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, []);

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color("#0066cc") },
          intensity: { value: 1.0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float time;
          uniform float intensity;
          varying vec3 vNormal;
          void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.5);
            float pulse = 0.9 + 0.1 * sin(time * 0.8);
            gl_FragColor = vec4(color, fresnel * 0.5 * intensity * pulse);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    []
  );

  const outerGlowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color("#003399") },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float time;
          varying vec3 vNormal;
          void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 1.5);
            float pulse = 0.8 + 0.2 * sin(time * 0.5);
            gl_FragColor = vec4(color, fresnel * 0.25 * pulse);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  // Entrance animation
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.scale.setScalar(0);
    gsap.to(group.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.8,
      delay: 0.5,
      ease: "back.out(1.5)",
    });
    gsap.to(group.position, {
      y: 0.25,
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, [groupRef]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x += delta * 0.015;
      planetMaterial.uniforms.time.value = timeRef.current;
    }
    if (glowRef.current) {
      atmosphereMaterial.uniforms.time.value = timeRef.current;
    }
    if (outerGlowRef.current) {
      outerGlowMaterial.uniforms.time.value = timeRef.current;
    }
  });

  const handlePointerOver = () => {
    hovered.current = true;
    gl.domElement.style.cursor = "pointer";
    gsap.to(planetMaterial.uniforms.hoverIntensity, { value: 1.0, duration: 0.4 });
    gsap.to(atmosphereMaterial.uniforms.intensity, { value: 1.5, duration: 0.4 });
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, { x: 1.04, y: 1.04, z: 1.04, duration: 0.4, ease: "power2.out" });
    }
  };

  const handlePointerOut = () => {
    hovered.current = false;
    gl.domElement.style.cursor = "auto";
    gsap.to(planetMaterial.uniforms.hoverIntensity, { value: 0.0, duration: 0.4 });
    gsap.to(atmosphereMaterial.uniforms.intensity, { value: 1.0, duration: 0.4 });
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
    }
  };

  const handleClick = () => {
    gsap.to(planetMaterial.uniforms.glowIntensity, {
      value: 3.0,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      onComplete: onExplode,
    });
  };

  return (
    // groupRef is passed in from Scene — Scene toggles .visible imperatively
    <group ref={groupRef}>
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[2.45, 64, 64]} />
        <primitive object={outerGlowMaterial} attach="material" />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.12, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[2, 256, 256]} />
        <primitive object={planetMaterial} attach="material" />
      </mesh>
    </group>
  );
}