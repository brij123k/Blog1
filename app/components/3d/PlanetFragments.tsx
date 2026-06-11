"use client";

import { useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

// ─── PlanetFragments ─────────────────────────────────────────────────────────
// FIX: always mounted, never unmounted.
// Visibility toggled imperatively via group.visible — no React state,
// so EffectComposer never resets and the screen never blinks.
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanetFragmentsHandle {
  showFragments: () => void;
  hideFragments: () => void;
  explode: () => void;
  reassemble: (onComplete: () => void) => void;
}

interface FragmentData {
  position: THREE.Vector3;
  originalPos: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  exploded: boolean;
  reassembling: boolean;
  done: boolean;
  mesh: THREE.Mesh | null;
}

const FRAGMENT_COUNT = 120;
const PLANET_RADIUS = 2;

function createFragmentMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      crackColor: { value: new THREE.Color("#00aaff") },
      rockColor: { value: new THREE.Color("#0a1828") },
      rockColor2: { value: new THREE.Color("#071320") },
      glowIntensity: { value: 1.0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 crackColor;
      uniform vec3 rockColor;
      uniform vec3 rockColor2;
      uniform float glowIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;

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
        float minDist = 100.0; float minDist2 = 100.0;
        for(int z=-1;z<=1;z++) for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
          vec3 offset=vec3(float(x),float(y),float(z));
          vec3 h=hash3(i+offset)*0.5+0.5;
          float d=length(offset+h-f);
          if(d<minDist){minDist2=minDist;minDist=d;}
          else if(d<minDist2){minDist2=d;}
        }
        return vec2(minDist,minDist2);
      }

      void main() {
        vec3 sp = vPosition * 2.2;
        vec2 vor = voronoi(sp);
        float crack = smoothstep(0.0, 0.1, vor.y - vor.x);
        float n1 = noise(vPosition * 4.0) * 0.5 + 0.5;
        vec3 rock = mix(rockColor, rockColor2, n1);
        float pulse = 0.85 + 0.15 * sin(time * 1.5 + vor.x * 8.0);
        float cracksEmit = (1.0 - crack) * pulse * glowIntensity;
        vec3 finalColor = mix(crackColor * cracksEmit * 2.5, rock, crack);
        float fresnel = pow(1.0 - max(dot(vNormal, vec3(0,0,1)),0.0), 2.5);
        finalColor += crackColor * fresnel * 0.6 * glowIntensity;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}

function randomOnSphere(radius: number): THREE.Vector3 {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

function createFragmentGeometry(scale: number): THREE.BufferGeometry {
  const base = new THREE.IcosahedronGeometry(scale, 0);
  const posAttr = base.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < posAttr.count; i++) {
    posAttr.setX(i, posAttr.getX(i) * (0.7 + Math.random() * 0.6));
    posAttr.setY(i, posAttr.getY(i) * (0.7 + Math.random() * 0.6));
    posAttr.setZ(i, posAttr.getZ(i) * (0.7 + Math.random() * 0.6));
  }
  posAttr.needsUpdate = true;
  base.computeVertexNormals();
  return base;
}

export const PlanetFragments = forwardRef<PlanetFragmentsHandle>(
  (_, ref) => {
    // The group is ALWAYS mounted — we just toggle .visible
    const groupRef = useRef<THREE.Group>(null!);
    const fragmentsRef = useRef<FragmentData[]>([]);
    const materialRef = useRef<THREE.ShaderMaterial>(createFragmentMaterial());
    const timeRef = useRef(0);
    const isReassembling = useRef(false);
    const onCompleteRef = useRef<(() => void) | null>(null);
    const reassembleStartTime = useRef(0);

    const geometries = useMemo(() => {
      const geos: THREE.BufferGeometry[] = [];
      const frags: FragmentData[] = [];
      for (let i = 0; i < FRAGMENT_COUNT; i++) {
        const pos = randomOnSphere(PLANET_RADIUS * (0.6 + Math.random() * 0.4));
        const scale = 0.18 + Math.random() * 0.38;
        geos.push(createFragmentGeometry(scale));
        frags.push({
          position: pos.clone(),
          originalPos: pos.clone(),
          velocity: new THREE.Vector3(),
          angularVelocity: new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ),
          rotation: new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          ),
          scale,
          exploded: false,
          reassembling: false,
          done: false,
          mesh: null,
        });
      }
      fragmentsRef.current = frags;
      return geos;
    }, []);

    const setMeshRef = useCallback((mesh: THREE.Mesh | null, index: number) => {
      if (fragmentsRef.current[index]) {
        fragmentsRef.current[index].mesh = mesh;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      showFragments: () => {
        if (groupRef.current) groupRef.current.visible = true;
      },

      hideFragments: () => {
        if (groupRef.current) groupRef.current.visible = false;
        // Reset all fragment positions back to origin for next explosion
        fragmentsRef.current.forEach((frag) => {
          frag.position.copy(frag.originalPos);
          frag.velocity.set(0, 0, 0);
          frag.exploded = false;
          frag.reassembling = false;
          frag.done = false;
          if (frag.mesh) {
            frag.mesh.position.copy(frag.originalPos);
          }
        });
      },

      explode: () => {
        isReassembling.current = false;

        fragmentsRef.current.forEach((frag, i) => {
          frag.exploded = false;
          frag.reassembling = false;
          frag.done = false;
          frag.position.copy(frag.originalPos);
          if (frag.mesh) frag.mesh.position.copy(frag.originalPos);

          // Staggered launch
          const delay = i * 4 + Math.random() * 20;
          setTimeout(() => {
            const dir = frag.originalPos.clone().normalize();
            const speed = 3.5 + Math.random() * 5;
            frag.velocity.set(
              dir.x * speed + (Math.random() - 0.5) * 2,
              dir.y * speed + (Math.random() - 0.5) * 2,
              dir.z * speed + (Math.random() - 0.5) * 2
            );
            frag.angularVelocity.set(
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            );
            frag.exploded = true;
          }, delay);
        });
      },

      reassemble: (onComplete: () => void) => {
        isReassembling.current = true;
        onCompleteRef.current = onComplete;
        reassembleStartTime.current = timeRef.current;

        fragmentsRef.current.forEach((frag) => {
          frag.reassembling = true;
          frag.done = false;
        });
      },
    }));

    useFrame((_, delta) => {
      timeRef.current += delta;

      // Don't waste GPU if fragments are hidden
      if (groupRef.current && !groupRef.current.visible) return;

      materialRef.current.uniforms.time.value = timeRef.current;

      const frags = fragmentsRef.current;
      let allDone = true;

      frags.forEach((frag) => {
        if (!frag.mesh) return;

        if (frag.exploded && !frag.reassembling && !frag.done) {
          allDone = false;
          frag.velocity.y += -0.5 * delta; // gravity
          frag.position.addScaledVector(frag.velocity, delta);
          frag.velocity.multiplyScalar(0.995);
          frag.angularVelocity.multiplyScalar(0.99);
          frag.rotation.x += frag.angularVelocity.x * delta;
          frag.rotation.y += frag.angularVelocity.y * delta;
          frag.rotation.z += frag.angularVelocity.z * delta;
          frag.mesh.position.copy(frag.position);
          frag.mesh.rotation.copy(frag.rotation);

        } else if (frag.reassembling && !frag.done) {
          allDone = false;
          const elapsed = timeRef.current - reassembleStartTime.current;
          const toOrigin = frag.originalPos.clone().sub(frag.position);
          const dist = toOrigin.length();

          if (dist < 0.04) {
            frag.done = true;
            frag.position.copy(frag.originalPos);
            frag.mesh.position.copy(frag.originalPos);
            return;
          }

          const magneticStrength = Math.min(elapsed * 3.5, 14);
          const force = toOrigin.normalize().multiplyScalar(magneticStrength * delta * (1 + dist * 0.5));
          frag.velocity.add(force);
          frag.velocity.multiplyScalar(0.88);
          frag.position.addScaledVector(frag.velocity, delta);
          frag.angularVelocity.multiplyScalar(Math.max(0.85, 1 - dist * 0.1));
          frag.rotation.x += frag.angularVelocity.x * delta;
          frag.rotation.y += frag.angularVelocity.y * delta;
          frag.rotation.z += frag.angularVelocity.z * delta;
          frag.mesh.position.copy(frag.position);
          frag.mesh.rotation.copy(frag.rotation);

        } else if (!frag.exploded) {
          frag.mesh.position.copy(frag.originalPos);
        }
      });

      // Reassembly complete
      if (isReassembling.current && allDone && onCompleteRef.current) {
        isReassembling.current = false;
        const cb = onCompleteRef.current;
        onCompleteRef.current = null;
        setTimeout(cb, 200);
      }
    });

    return (
      // Initially hidden — Scene.showFragments() makes this visible
      <group ref={groupRef} visible={false}>
        {geometries.map((geo, i) => (
          <mesh
            key={i}
            ref={(mesh) => setMeshRef(mesh, i)}
            geometry={geo}
            material={materialRef.current}
            position={fragmentsRef.current[i]?.originalPos.toArray() as [number, number, number]}
          />
        ))}
      </group>
    );
  }
);

PlanetFragments.displayName = "PlanetFragments";